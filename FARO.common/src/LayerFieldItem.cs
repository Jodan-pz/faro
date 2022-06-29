namespace FARO.Common {
    public class LayerFieldItem {
        readonly ILayer _layer;
        readonly string _field;
        readonly IDecorator _decorator;

        public string Field => _field;
        public IDecorator Decorator => _decorator;
        public ILayer Layer => _layer;

        public LayerFieldItem(ILayer layer, string field, IDecorator decorator) {
            _layer = layer;
            _field = field;
            _decorator = decorator;
        }

        public override string ToString() {
            return $@"Field: {_field}
{new string('-', 80)}
Decorator: {_decorator}
";
        }
    }
}
