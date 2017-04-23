import mapping, {
    IGraphQLObjectTypeConfig,
    IGraphQLObjectTypeFieldConfig,
    IGraphQLSchemaConfig,
    IMapperOptional,
} from "./..";
import schema from "./../__fixtures__/github";
class Mapper implements IMapperOptional {
    public mapGraphQLSchema(config: IGraphQLSchemaConfig) {
        return {
            query: config.query,
            mutation: config.mutation,
        };
    }
    public mapGraphQLObjectType(config: IGraphQLObjectTypeConfig) {
        return {
            fields: config.fields.map((f) => {
                return f;
            }),
        };
    }
    public mapGraphQLObjectTypeField(config: IGraphQLObjectTypeFieldConfig) {
        return config.name;
    }
}
describe("Mapper", () => {
    it("simple", () => {
        const result = mapping(schema, new Mapper());
        expect(result).toMatchSnapshot();
    });
});
