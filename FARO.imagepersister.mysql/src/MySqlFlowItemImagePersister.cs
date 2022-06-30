using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Data;
using System.Linq;

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

using FARO.Common;
using FARO.Common.Domain;
using FARO.Services.ImagePersister.Model;

using MySqlConnector;

using Newtonsoft.Json;

namespace FARO.Services.ImagePersister {
    /// <summary>
    /// 
    ///  IMAGE PERSISTER - MySql implementation
    /// 
    ///  -===================================================-
    ///  -======== Creating rules by BuildStep value ========-
    ///  -===================================================-
    /// 
    ///  CLEAR
    ///       delete everything
    /// 
    ///  LAYER:{name}
    ///      delete layer name and subsequent layers
    ///      delete rows
    ///      delete aggregations
    /// 
    ///  ROW
    ///      delete rows
    ///      delete aggregations
    /// 
    ///  AGGREGATOR
    ///      delete aggragations
    ///  
    ///  ********************* PREVENT PERSISTER PERSISTENCE *********************
    ///  Use Exclamation Point (!) to prevent persister writing, example:
    /// 
    ///      LAYER!:test
    ///         will evaluate from persister at layer named test
    ///         with no persistence updates
    /// 
    ///     ROW!
    ///         will evaluate from persisted row with no persistence updates
    /// 
    ///     AGGREGATOR!
    ///         will evaluate from persisted aggregator with no persistence updates
    /// 
    /// </summary>
    public class MySqlFlowItemImagePersister : IFlowItemImagePersister, IDisposable {
        private readonly ImagePersisterDbContext _dataContext;
        private readonly ILogger<MySqlFlowItemImagePersister> _logger;
        private Images _currentImage = null;
        private bool _isDisposed = false;
        private bool _dataContextInitialized = false;
        private ConcurrentBag<DataRow> _keys = null;
        private DataTable _keysDataTable = null;
        private ConcurrentBag<object[]> _layers = null;
        private DataTable _layersDataTable = null;
        private ConcurrentBag<object[]> _rows = null;
        private DataTable _rowsDataTable = null;
        private ConcurrentBag<DataRow> _aggregations = null;
        private DataTable _aggregationsDataTable = null;


        #region Constructor & Destructor
        public MySqlFlowItemImagePersister(ImagePersisterDbContext dataContext, ILogger<MySqlFlowItemImagePersister> logger = null) {
            _dataContext = dataContext ?? throw new ArgumentNullException(nameof(dataContext));
            _dataContext.ChangeTracker.QueryTrackingBehavior = QueryTrackingBehavior.NoTrackingWithIdentityResolution;
            _logger = logger;
        }

        public void Dispose() {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        protected virtual void Dispose(bool disposing) {
            if (_isDisposed) {
                return;
            }
            if (disposing) {
                Flush();
                _dataContext.Dispose();
            }
            _isDisposed = true;
        }

        ~MySqlFlowItemImagePersister() {
            // Finalizer calls Dispose(false)
            Dispose(false);
        }
        #endregion        

        public IImageOutput Init(FlowItem flowItem, IDictionary<string, object> imageArgs) {
            if (!flowItem.RunOptions.ImagePersister?.Enabled ?? false) return null;
            InitDataTables();
            var argsHash = GetArgsHash(imageArgs);
            if (flowItem.IsImagePersisterClearStep()) Clear(flowItem, argsHash);
            _currentImage = _dataContext.Images.SingleOrDefault(i => i.ImageKey == flowItem.Image.Definition.Id && i.ImageArgs == argsHash);
            _dataContextInitialized = true;
            if (_currentImage is null) {
                return CreateEmptyOutput(flowItem, argsHash, out _currentImage);
            }
            return CreateOutput(flowItem);
        }

        public FlowItemImagePersisterState GetPersisterState(FlowItem flowItem, IDictionary<string, object> imageArgs) {
            var ret = new FlowItemImagePersisterState();
            var argsHash = GetArgsHash(imageArgs);
            var img = _dataContext.Images.SingleOrDefault(i => i.ImageKey == flowItem.Image.Definition.Id && i.ImageArgs == argsHash);
            if (flowItem.IsImagePersisterClearStep() || img is null) {
                ret.IsNew = true;
            }
            if (img is not null) {
                // seek keys
                ret.KeysExists = _dataContext.Keys.FirstOrDefault(k => k.IdImageNavigation == img) != null;
                // seek layers
                ret.Layers = _dataContext.Layers.Where(k => k.IdImageNavigation == img).Select(l => l.Name).Distinct();
                // seek rows
                ret.RowsExists = _dataContext.Rows.FirstOrDefault(k => k.IdImageNavigation == img) != null;
                if (flowItem.Definition.AggregatorId != null) {
                    // seek aggregations
                    ret.AggregationExists = _dataContext.Aggregations.FirstOrDefault(a => a.IdImageNavigation == img &&
                                                                                           a.AggregatorKey == flowItem.Definition.AggregatorId) != null;
                }
            }
            switch (flowItem.ImagePersisterBuildStep()) {
                case BuildLayerStep step: {
                        ret.LayerStepRequested = true;
                        ret.LayerStepName = step.LayerName;
                        break;
                    }
                case BuildStep.Row: {
                        ret.RowStepRequested = true;
                        break;
                    }
                case BuildStep.Aggregator: {
                        ret.AggregationStepRequested = true;
                        break;
                    }
            }
            return ret;
        }

        public void Flush() {
            if (!_dataContextInitialized) return;
            var willWrite = (_keys.Count + _layers.Count + _rows.Count + _aggregations.Count) > 0;
            if (willWrite) {
                _logger?.LogInformation("Finalizing persistence...");
                _logger?.LogTrace("Writing keys...         {Count,10}", _keys.Count);
                BulkWrite(_keys);
                _logger?.LogTrace("Writing layers...       {Count,10}", _layers.Count);
                BulkWrite<Layers>(_layers);
                _logger?.LogTrace("Writing rows...         {Count,10}", _rows.Count);
                BulkWrite<Rows>(_rows);
                _logger?.LogTrace("Writing aggregations... {Count,10}", _aggregations.Count);
                BulkWrite(_aggregations);
                _logger?.LogInformation("Persister end.", nameof(MySqlFlowItemImagePersister));
            }
        }


        #region Bulk & SQL
        private void InitDataTables() {
            _keys = new();
            _keysDataTable = new DataTable("Keys");
            _keysDataTable.Columns.Add("IdImage", typeof(int));
            _keysDataTable.Columns.Add("RowIdx", typeof(int));
            _keysDataTable.Columns.Add("Values", typeof(string));
            _layers = new();
            _layersDataTable = new DataTable("Layers");
            _layersDataTable.Columns.Add("IdImage", typeof(int));
            _layersDataTable.Columns.Add("RowIdx", typeof(int));
            _layersDataTable.Columns.Add("Name", typeof(string));
            _layersDataTable.Columns.Add("Values", typeof(string));
            _rows = new();
            _rowsDataTable = new DataTable("Rows");
            _rowsDataTable.Columns.Add("IdImage", typeof(int));
            _rowsDataTable.Columns.Add("RowIdx", typeof(int));
            _rowsDataTable.Columns.Add("Values", typeof(string));
            _aggregations = new();
            _aggregationsDataTable = new DataTable("Aggregations");
            _aggregationsDataTable.Columns.Add("IdImage", typeof(int));
            _aggregationsDataTable.Columns.Add("RowIdx", typeof(int));
            _aggregationsDataTable.Columns.Add("AggregatorKey", typeof(string));
            _aggregationsDataTable.Columns.Add("Values", typeof(string));
        }

        private bool BulkWrite<T>(IEnumerable<object[]> rows) where T : class {
            var firstItem = rows?.FirstOrDefault();
            if (firstItem is null) return true;
            DataTable dataTable = null;
            if (typeof(T) == typeof(Keys)) dataTable = _keysDataTable;
            else if (typeof(T) == typeof(Layers)) dataTable = _layersDataTable;
            else if (typeof(T) == typeof(Rows)) dataTable = _rowsDataTable;
            else if (typeof(T) == typeof(Aggregations)) dataTable = _aggregationsDataTable;
            return BulkWrite(rows.Select(row => {
                var toWrite = dataTable.NewRow();
                toWrite.ItemArray = row;
                return toWrite;
            }));
        }

        private bool BulkWrite(IEnumerable<DataRow> rows) {
            try {
                var firstItem = rows?.FirstOrDefault();
                if (firstItem is null) return true;
                var dataTable = firstItem.Table;
                var result = true;
                var connection = _dataContext.Database.GetDbConnection();
                var bulkCopy = new MySqlBulkCopy((MySqlConnection)connection)
                {
                    DestinationTableName = $"`{dataTable.TableName}`"
                };
                // the column mapping is required if you have a identity column in the table
                var bukCols = dataTable.Columns.OfType<DataColumn>()
                                                .Select((c, i) => new MySqlBulkCopyColumnMapping(i, c.ColumnName));
                bulkCopy.ColumnMappings.AddRange(bukCols);
                bulkCopy.WriteToServer(rows, dataTable.Columns.Count);
                return result;
            } catch (Exception ex) {
                _logger?.LogError(ex, "Bulk error");
            }
            return false;
        }

        private static string DeleteTableByImage(string tableName, string preserveFragment = null) {
            var toPreserve = preserveFragment is not null
                             ? $"OR ( t.IdImage = {{0}} and {preserveFragment} )"
                             : string.Empty;
            var ret = @$" 
                    DROP TABLE IF EXISTS tmp_{tableName};
                    CREATE TABLE tmp_{tableName} AS SELECT * FROM `{tableName}` t WHERE t.IdImage <> {{0}} {toPreserve};
                    TRUNCATE table `{tableName}`;
                    INSERT INTO `{tableName}` SELECT * FROM tmp_{tableName};
                    DROP TABLE tmp_{tableName};";

            return ret;
        }

        #endregion

        private static string GetArgsHash(IDictionary<string, object> imageArgs) => JsonConvert.SerializeObject(imageArgs);

        private void Clear(FlowItem flowItem, string argsHash) {
            var img = _dataContext.Images.SingleOrDefault(i => i.ImageKey == flowItem.Image.Definition.Id && i.ImageArgs == argsHash);
            if (img is not null) {
                _dataContext.Database.ExecuteSqlRaw(DeleteTableByImage("Keys"), img.Id);
                _dataContext.Database.ExecuteSqlRaw(DeleteTableByImage("Layers"), img.Id);
                _dataContext.Database.ExecuteSqlRaw(DeleteTableByImage("Rows"), img.Id);
                _dataContext.Database.ExecuteSqlRaw(DeleteTableByImage("Aggregations"), img.Id);
                _dataContext.Remove(img);
                _dataContext.SaveChanges();
            }
        }

        private IImageOutput CreateEmptyOutput(FlowItem flowItem, string argsHash, out Images image) {
            image = new Images
            {
                ImageKey = flowItem.Image.Definition.Id,
                ImageArgs = argsHash
            };
            _dataContext.Images.Add(image);
            _dataContext.SaveChanges();
            return new ImageOutput
            {
                OnChange = OnOutputChangeEventHandler
            };
        }

        private IImageOutput CreateOutput(FlowItem flowItem) {
            return flowItem.ImagePersisterBuildStep() switch
            {
                BuildLayerStep step => FillFromLayer(flowItem, step.LayerName),
                BuildStep.Row => FillFromRow(flowItem),
                BuildStep.Aggregator => FillFromAggregator(flowItem),
                _ => FillFromLast(flowItem),
            };
        }

        private FillOutputResult FillOutput(FlowItem flowItem,
                                            bool useRow = false,
                                            bool useAggregation = false,
                                            string layerName = null,
                                            bool layerIsInclusive = false) {

            var flowItemAggregationId = flowItem.Aggregator?.Definition.Id;
            var flowItemLayerNames = flowItem.Image?.Definition.Layers.Select(l => l.Name).ToArray();
            Action<ChangeOutputEventArgs> changeHandler = flowItem.IsImagePersisterPreventChanges() ? null : OnOutputChangeEventHandler;

            FillOutputResult ret = new();
            if (_currentImage is null) return ret;

            if (useAggregation && flowItemAggregationId is not null) {
                var aggrItems = _dataContext.Aggregations.Where(a => a.IdImageNavigation == _currentImage && a.AggregatorKey == flowItemAggregationId);
                if (aggrItems.Any()) {
                    ret.AggregationLoaded = true;
                    ret.Output = new ImageOutput(
                                        aggrItems
                                        .OrderBy(agg => agg.RowIdx)
                                        .Select(lay => JsonConvert.DeserializeObject<IDictionary<string, object>>(lay.Values)),
                                        row => { row.Discard = false; }
                                        );
                }
            }
            if (layerName is null && (useRow || !ret.IsLoaded)) {
                var rowItems = _dataContext.Rows.Where(l => l.IdImageNavigation == _currentImage);
                if (rowItems.Any()) {
                    ret.RowLoaded = true;
                    ret.Output = new ImageOutput(
                                        rowItems
                                        .OrderBy(row => row.RowIdx)
                                        .Select(lay => JsonConvert.DeserializeObject<IDictionary<string, object>>(lay.Values)),
                                        row => { row.Discard = false; }
                                        )
                    { OnChange = changeHandler };
                }
            }
            if (layerName is not null || !ret.IsLoaded) {
                var layers = flowItemLayerNames.TakeWhile(l => l != layerName);
                if (layerIsInclusive && layers.Count() < flowItemLayerNames.Length) {
                    layers = layers.Append(layerName);
                }
                foreach (var layer in layers.Reverse()) {
                    var layerItems = _dataContext.Layers.Where(l => l.IdImageNavigation == _currentImage && l.Name == layer);
                    if (layerItems.Any()) {
                        ret.LayerNameLoaded = layer;
                        ret.Output = new ImageOutput(
                                            layerItems
                                            .OrderBy(lay => lay.RowIdx)
                                            .Select(lay => JsonConvert.DeserializeObject<IDictionary<string, object>>(lay.Values))
                                            )
                        { OnChange = changeHandler };
                        break;
                    }
                }
            }
            if (!ret.IsLoaded) {
                var keyItems = _dataContext.Keys.Where(k => k.IdImageNavigation == _currentImage);
                if (keyItems.Any()) {
                    ret.KeysLoaded = true;
                    ret.Output = new ImageOutput(
                        keyItems
                        .OrderBy(key => key.RowIdx)
                        .Select(key => JsonConvert.DeserializeObject<IDictionary<string, object>>(key.Values))
                        )
                    { OnChange = changeHandler };
                }
            }
            return ret;
        }

        private static void AdjustFlowItem(FlowItem flowItem, FillOutputResult fillResult) {
            if (fillResult.IsLoaded) {
                if (fillResult.AggregationLoaded) {
                    flowItem.Aggregator = null;
                    flowItem.Validator = null;
                }
                if (!fillResult.KeysLoaded) {
                    if (fillResult.LayerNameLoaded is not null) {
                        flowItem.Image.Definition.Layers = flowItem.Image.Definition.Layers
                                                           .SkipWhile(l => l.Name != fillResult.LayerNameLoaded)
                                                           .Skip(1);
                    } else {
                        flowItem.Image.Definition.Layers = null;
                    }
                }
                flowItem.Image.Definition.KeysIterators = null;
            } else if (fillResult.IsEmpty) {
                flowItem.Aggregator = null;
                flowItem.Validator = null;
                flowItem.Image.Definition.Layers = null;
                flowItem.Image.Definition.KeysIterators = null;
            }
        }

        private IImageOutput FillFromLast(FlowItem flowItem) {
            var fillResult = FillOutput(flowItem, useAggregation: true);
            AdjustFlowItem(flowItem, fillResult);
            return fillResult.Output;
        }

        private ImageOutput FillFromAggregator(FlowItem flowItem) {
            if (_currentImage is null) return null;
            if (flowItem.Aggregator is not null && !flowItem.IsImagePersisterPreventChanges()) {
                _dataContext.Database.ExecuteSqlRaw(
                    DeleteTableByImage("Aggregations", preserveFragment: "t.AggregatorKey <> {1}"),
                     _currentImage.Id,
                     flowItem.Aggregator.Definition.Id
                );
            }
            var fillResult = FillOutput(flowItem, useRow: true);
            AdjustFlowItem(flowItem, fillResult);
            return fillResult.Output;
        }

        private ImageOutput FillFromRow(FlowItem flowItem) {
            if (_currentImage is null) return null;
            if (!flowItem.IsImagePersisterPreventChanges()) {
                _dataContext.Database.ExecuteSqlRaw(DeleteTableByImage("Rows"), _currentImage.Id);
                _dataContext.Database.ExecuteSqlRaw(DeleteTableByImage("Aggregations"), _currentImage.Id);
            }

            var lastLayer = flowItem.Image.Definition.Layers.LastOrDefault();
            var fillResult = FillOutput(flowItem, layerName: lastLayer?.Name, layerIsInclusive: true);
            AdjustFlowItem(flowItem, fillResult);
            return fillResult.Output;
        }

        private ImageOutput FillFromLayer(FlowItem flowItem, string layerName) {
            if (_currentImage is null) return null;
            if (!flowItem.IsImagePersisterPreventChanges()) {
                var layersToDelete = flowItem.Image.Definition.Layers.SkipWhile(layer => layer.Name != layerName)
                                                                     .Select(l => l.Name)
                                                                     .Cast<object>();
                if (layersToDelete.Any()) {
                    var placeholders = string.Join(",", layersToDelete.Select((_, idx) => "{" + (++idx) + "}"));
                    _dataContext.Database.ExecuteSqlRaw(
                        DeleteTableByImage("Layers", preserveFragment: $"t.Name NOT IN ({placeholders})"),
                        layersToDelete.Prepend(_currentImage.Id)
                    );

                }
                _dataContext.Database.ExecuteSqlRaw(DeleteTableByImage("Rows"), _currentImage.Id);
                _dataContext.Database.ExecuteSqlRaw(DeleteTableByImage("Aggregations"), _currentImage.Id);
            }

            var fillResult = FillOutput(flowItem, layerName: layerName);
            AdjustFlowItem(flowItem, fillResult);
            return fillResult.Output;
        }

        private void OnOutputChangeEventHandler(ChangeOutputEventArgs changeOutputEventArgs) {
            switch (changeOutputEventArgs.ChangeType) {
                case ImageOutputChangeType.Keys:
                    if (changeOutputEventArgs.Row is null) return;
                    var key = _keysDataTable.NewRow();
                    key.ItemArray = new object[]{
                        _currentImage.Id,
                        changeOutputEventArgs.Row.Idx,
                        JsonConvert.SerializeObject(changeOutputEventArgs.Row.ToDictionary())
                    };
                    _keys.Add(key);
                    break;
                case ImageOutputChangeType.Layer:
                    if (changeOutputEventArgs.Row is null) return;
                    _layers.Add(new object[]{
                        _currentImage.Id,
                        changeOutputEventArgs.Row.Idx,
                        changeOutputEventArgs.Layer.Name,
                        JsonConvert.SerializeObject(changeOutputEventArgs.Row.ToDictionary())
                    });
                    break;
                case ImageOutputChangeType.Row:
                    if (changeOutputEventArgs.Row is null) return;
                    _rows.Add(new object[]{
                        _currentImage.Id,
                        changeOutputEventArgs.Row.Idx,
                        JsonConvert.SerializeObject(changeOutputEventArgs.Row.ToDictionary())
                    });
                    break;
                case ImageOutputChangeType.Aggregation:
                    if (changeOutputEventArgs.Sender is not IAggregator currentAggregator) return;
                    changeOutputEventArgs.Output.IterateRows(row => {
                        var aggregation = _aggregationsDataTable.NewRow();
                        aggregation.ItemArray = new object[]{
                            _currentImage.Id,
                            row.Idx,
                            currentAggregator.Definition.Id,
                            JsonConvert.SerializeObject(row.ToDictionary())
                        };
                        _aggregations.Add(aggregation);
                    });
                    break;
            }
            // Console.WriteLine(
            //     $"EVT: {changeOutputEventArgs.ChangeType} - {changeOutputEventArgs.Row?.ToString()} - {changeOutputEventArgs.Layer?.Name}");
        }
    }
}
