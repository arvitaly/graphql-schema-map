"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("./..");
const schema_1 = require("./../__fixtures__/schema");
class Mapper {
    mapGraphQLSchema(config) {
        return {
            query: config.query,
            mutation: config.mutation,
        };
    }
    mapGraphQLObjectType(config) {
        return {
            fields: config.fields.map((f) => {
                return f;
            }),
        };
    }
    mapGraphQLObjectTypeField(config) {
        return config.name;
    }
}
describe("Mapper", () => {
    it("simple", () => {
        const result = __1.default(schema_1.default, new Mapper());
        expect(result).toMatchSnapshot();
    });
});
