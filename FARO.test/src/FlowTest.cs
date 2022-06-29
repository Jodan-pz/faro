using System;
using System.Linq;

using FARO.Common;
using FARO.Common.Domain;
using FARO.Test.BaseClasses;

using Xunit;
using Xunit.Abstractions;

namespace FARO.Test {
    [Collection("Document collection")]
    public class FlowTest : DocumentBaseTest {
        public FlowTest(DocumentFixture fixture, ITestOutputHelper output) : base(fixture, output) {
            DocumentUnitOfWork.DeleteAll("flows");
            var flow1 = new FlowItemDefinition
            {
                Name = "Flow1",
                Description = "Common flow test",
                Tags = new string[] { "music", "art", "it" }
            };
            var flow2 = new FlowItemDefinition
            {
                Name = "Flow2",
                Description = "Common flow test #2",
                Tags = new string[] { "music", "it", "cooking" }
            };
            var flow3 = new FlowItemDefinition
            {
                Name = "OtherFlow",
                Description = "UnCommon flow test",
                Tags = new string[] { "it" }
            };

            DataService.CreateFlowItem(flow1);
            DataService.CreateFlowItem(flow2);
            DataService.CreateFlowItem(flow3);
        }

        [Fact(DisplayName = "List flows")]
        public void List_Flows_Test() {
            var flows = DataService.ListFlowItems();
            Assert.NotNull(flows);
            Assert.NotEmpty(flows);
            Assert.Equal(3, flows.Count());
            Assert.All(flows, f => Assert.Contains("flow", f.Name, StringComparison.InvariantCultureIgnoreCase));
        }

        [Fact(DisplayName = "List flows with paging")]
        public void List_Flows_With_Paging_Test() {
            var flows = DataService.ListFlowItems(pageIndex: 2, pageSize: 1);
            Assert.NotNull(flows);
            Assert.NotEmpty(flows);
            var pageItem = Assert.Single(flows);
            Assert.Contains("#2", pageItem.Description, StringComparison.InvariantCultureIgnoreCase);
        }

        [Fact(DisplayName = "List flows based by filter mode startswith")]
        public void List_Flows_With_FilterMode_StartsWith_Test() {
            var flows = DataService.ListFlowItems("Common", FilterMatchMode.StartsWith);
            Assert.NotNull(flows);
            Assert.NotEmpty(flows);
            Assert.Equal(2, flows.Count());
            Assert.All(flows, f => Assert.Contains("common", f.Description, StringComparison.InvariantCultureIgnoreCase));
        }

        [Fact(DisplayName = "List flows based by filter mode contains")]
        public void List_Flows_With_FilterMode_Contains_Test() {
            var flows = DataService.ListFlowItems("#", FilterMatchMode.Contains);
            Assert.NotNull(flows);
            Assert.NotEmpty(flows);
            var flow = Assert.Single(flows);
            Assert.Contains("2", flow.Description, StringComparison.InvariantCultureIgnoreCase);
        }

        [Fact(DisplayName = "List flows based by filter mode exact")]
        public void List_Flows_With_FilterMode_Exact_Test() {
            var flows = DataService.ListFlowItems("Flow2", FilterMatchMode.Exact);
            Assert.NotNull(flows);
            Assert.NotEmpty(flows);
            var flow = Assert.Single(flows);
            Assert.Contains("#2", flow.Description, StringComparison.InvariantCultureIgnoreCase);
        }

        [Fact(DisplayName = "List flows based by filter mode startswith (no-macth)")]
        public void List_Flows_With_FilterMode_StartsWith_NoMatch_Test() {
            var flows = DataService.ListFlowItems("low", FilterMatchMode.StartsWith);
            Assert.NotNull(flows);
            Assert.Empty(flows);
        }

        [Fact(DisplayName = "List flows based by filter mode contains (no-macth)")]
        public void List_Flows_With_FilterMode_Contains_NoMatch_Test() {
            var flows = DataService.ListFlowItems("loz", FilterMatchMode.Contains);
            Assert.NotNull(flows);
            Assert.Empty(flows);
        }

        [Fact(DisplayName = "List flows based by filter mode exact (no-macth)")]
        public void List_Flows_With_FilterMode_Exact_NoMatch_Test() {
            var flows = DataService.ListFlowItems("Flow3", FilterMatchMode.Exact);
            Assert.NotNull(flows);
            Assert.Empty(flows);
        }

        [Fact(DisplayName = "List flows based by tags mode any")]
        public void List_Flows_With_Tags_Any_Test() {
            var flows = DataService.ListFlowItems(tags: new string[] { "music", "unkonw" }, tagsMatchMode: TagsMatchMode.Any);
            Assert.NotNull(flows);
            Assert.NotEmpty(flows);
            Assert.Equal(2, flows.Count());
        }

        [Fact(DisplayName = "List flows based by tags mode all")]
        public void List_Flows_With_Tags_All_Test() {
            var flows = DataService.ListFlowItems(tags: new string[] { "music" }, tagsMatchMode: TagsMatchMode.All);
            Assert.NotNull(flows);
            Assert.NotEmpty(flows);
            Assert.Equal(2, flows.Count());

            var flows2 = DataService.ListFlowItems(tags: new string[] { "cooking", "music", "it" }, tagsMatchMode: TagsMatchMode.All);
            Assert.NotNull(flows2);
            Assert.NotEmpty(flows2);
            var flow2 = Assert.Single(flows2);
            Assert.Equal(3, flow2.Tags.Count());
            Assert.Contains(flow2.Tags, t => new string[] { "it", "cooking", "music" }.Contains(t));
        }

        [Fact(DisplayName = "List flows based by tags mode any (no-match)")]
        public void List_Flows_With_Tags_Any_NoMatch_Test() {
            var flows = DataService.ListFlowItems(tags: new string[] { "code" }, tagsMatchMode: TagsMatchMode.Any);
            Assert.NotNull(flows);
            Assert.Empty(flows);
        }

        [Fact(DisplayName = "List flows based by tags mode all (no-macth)")]
        public void List_Flows_With_Tags_All_NoMatchTest() {
            var flows = DataService.ListFlowItems(tags: new string[] { "music", "it", "code" }, tagsMatchMode: TagsMatchMode.All);
            Assert.NotNull(flows);
            Assert.Empty(flows);
        }
    }
}
