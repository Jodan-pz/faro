using FARO.Common;

using Xunit;
using Xunit.Abstractions;

using Yoda.Common.Interfaces;

namespace FARO.Test.BaseClasses {
    [Collection("Document collection")]
    public class DocumentBaseTest : BaseTest {
        private readonly DocumentFixture _fixture = null;

        public DocumentBaseTest(DocumentFixture fixture, ITestOutputHelper output) : base(output) {
            _fixture = fixture;
        }

        protected IAppSupport AppSupport => _fixture.AppSupport;
        protected IDocumentUnitOfWork DocumentUnitOfWork => _fixture.DocumentUnitOfWork;
        protected IDefinitionDataService DataService => _fixture.DataService;
        protected IDefinitionSupportService DefinitionSupportService => _fixture.DefinitionSupportService;
        protected IFlowConfigurationReader FlowConfigurationReader => _fixture.FlowConfigurationReader;
        protected IFlowConfigurationBuilder FlowConfigurationBuilder => _fixture.FlowConfigurationBuilder;
        protected IIntegrityCheckService IntegrityCheckService => _fixture.IntegrityCheckService;
        protected IEngineFactory EngineFactory => _fixture.EngineFactory;
        protected IExpressionEvaluator ExpressionEvaluator => _fixture.ExpressionEvaluator;
        protected IFlowRunner FlowRunner => _fixture.FlowRunner;
        protected IFlowRunner DumpFlowRunner => _fixture.DumpFlowRunner;
    }
}
