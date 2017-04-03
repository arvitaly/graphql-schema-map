"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const g = require("graphql");
exports.default = (schema, mapping) => {
    const mapper = new Mapper(schema, mapping);
    return mapper.map();
};
// tslint:disable-next-line:max-line-length
const keys = ["mapGraphQLSchema", "mapGraphQLObjectType", "mapGraphQLObjectTypeField", "mapGraphQLObjectTypeFieldType", "mapGraphQLObjectTypeFieldArg"];
class Mapper {
    constructor(schema, mapp) {
        this.schema = schema;
        this.mapp = mapp;
        this.mapping = {
            mapGraphQLObjectType: (config) => config.type,
            mapGraphQLScalarType: (config) => config.type,
            mapGraphQLObjectTypeField: (config) => config.type,
            mapGraphQLObjectTypeFieldArg: (config) => config.type,
            mapGraphQLObjectTypeFieldType: (config) => config.type,
            mapGraphQLSchema: (config) => config.schema,
        };
        this.types = [];
        keys.map((f) => {
            if (this.mapp[f]) {
                this.mapping[f] = this.mapp[f];
            }
        });
    }
    map() {
        const queryType = this.schema.getQueryType();
        const query = queryType ? this.mapGraphQLObjectType(queryType) : undefined;
        const mutationType = this.schema.getMutationType();
        const mutation = mutationType ? this.mapGraphQLObjectType(mutationType) : undefined;
        return this.mapping.mapGraphQLSchema({
            schema: this.schema,
            query,
            mutation,
        });
    }
    setMapGraphQLObjectType(f) {
        this.mapping.mapGraphQLObjectType = f;
    }
    setMapGraphQLScalarType(f) {
        this.mapping.mapGraphQLScalarType = f;
    }
    setMapGraphQLObjectTypeField(f) {
        this.mapping.mapGraphQLObjectTypeField = f;
    }
    setMapGraphQLObjectTypeFieldType(f) {
        this.mapping.mapGraphQLObjectTypeFieldType = f;
    }
    setMapGraphQLObjectTypeFieldArg(f) {
        this.mapping.mapGraphQLObjectTypeFieldArg = f;
    }
    mapGraphQLObjectType(type) {
        if (this.types.some((t) => t === type)) {
            return;
        }
        this.types.push(type);
        const fields = type.getFields();
        const mapFields = Object.keys(fields).map((fieldName) => {
            const field = fields[fieldName];
            let realType = field.type;
            if (realType instanceof g.GraphQLNonNull) {
                realType = realType.ofType;
            }
            if (realType instanceof g.GraphQLObjectType) {
                this.mapGraphQLObjectType(realType);
            }
            if (realType instanceof g.GraphQLScalarType) {
                this.mapping.mapGraphQLScalarType({ type: realType });
            }
            const mapFieldType = this.mapping.mapGraphQLObjectTypeFieldType({
                objectType: type,
                name: fieldName,
                type: field.type,
            });
            const mapArgs = field.args.map((arg) => {
                return this.mapping.mapGraphQLObjectTypeFieldArg({
                    fieldName,
                    name: arg.name,
                    type: arg.type,
                    objectType: type,
                });
            });
            this.mapping.mapGraphQLObjectTypeField({
                args: mapArgs,
                name: fieldName,
                objectType: type,
                type: mapFieldType,
            });
        });
        return this.mapping.mapGraphQLObjectType({
            type,
            fields: mapFields,
        });
    }
}
exports.Mapper = Mapper;
