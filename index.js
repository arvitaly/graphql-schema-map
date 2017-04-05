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
            mapGraphQLObjectType: (config) => config,
            mapGraphQLInputObjectType: (config) => config,
            mapGraphQLScalarType: (config) => config,
            mapGraphQLInterfaceType: (config) => config,
            mapGraphQLObjectTypeField: (config) => config,
            mapGraphQLInputObjectTypeField: (config) => config,
            mapGraphQLObjectTypeFieldArg: (config) => config,
            mapGraphQLObjectTypeFieldType: (config) => config,
            mapGraphQLInputObjectTypeFieldType: (config) => config,
            mapGraphQLSchema: (config) => config,
            mapGraphQLObjectTypeFieldArgs: (config) => config,
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
    setMapGraphQLInputObjectType(f) {
        this.mapping.mapGraphQLInputObjectType = f;
    }
    setMapGraphQLScalarType(f) {
        this.mapping.mapGraphQLScalarType = f;
    }
    setMapGraphQLInterfaceType(f) {
        this.mapping.mapGraphQLInterfaceType = f;
    }
    setMapGraphQLObjectTypeField(f) {
        this.mapping.mapGraphQLObjectTypeField = f;
    }
    setMapGraphQLInputObjectTypeField(f) {
        this.mapping.mapGraphQLInputObjectTypeField = f;
    }
    setMapGraphQLObjectTypeFieldType(f) {
        this.mapping.mapGraphQLObjectTypeFieldType = f;
    }
    setMapGraphQLInputObjectTypeFieldType(f) {
        this.mapping.mapGraphQLInputObjectTypeFieldType = f;
    }
    setMapGraphQLObjectTypeFieldArg(f) {
        this.mapping.mapGraphQLObjectTypeFieldArg = f;
    }
    setMapGraphQLObjectTypeFieldArgs(f) {
        this.mapping.mapGraphQLObjectTypeFieldArgs = f;
    }
    mapGraphQLObjectTypeFieldType(name, objectType, type) {
        const info = this.mapOutput(type);
        return this.mapping.mapGraphQLObjectTypeFieldType({
            name,
            objectType,
            type,
            isArray: info.isArray,
            isNonNull: info.isNonNull,
            realType: info.realType,
        });
    }
    mapGraphQLInputObjectTypeFieldType(name, objectType, type) {
        const info = this.mapOutput(type);
        return this.mapping.mapGraphQLInputObjectTypeFieldType({
            name,
            objectType,
            type,
            isArray: info.isArray,
            isNonNull: info.isNonNull,
            realType: info.realType,
        });
    }
    mapOutput(type) {
        let realType = type;
        let isArray = false;
        let isNonNull = false;
        if (realType instanceof g.GraphQLNonNull) {
            realType = realType.ofType;
            isNonNull = true;
        }
        if (realType instanceof g.GraphQLList) {
            realType = realType.ofType;
            if (realType instanceof g.GraphQLNonNull) {
                realType = realType.ofType;
            }
            isArray = true;
        }
        if (realType instanceof g.GraphQLObjectType) {
            this.mapGraphQLObjectType(realType);
        }
        else if (realType instanceof g.GraphQLScalarType) {
            this.mapping.mapGraphQLScalarType({ type: realType });
        }
        else if (realType instanceof g.GraphQLInterfaceType) {
            this.mapping.mapGraphQLInterfaceType({ type: realType });
        }
        else if (realType instanceof g.GraphQLInputObjectType) {
            this.mapGraphQLInputObjectType(realType);
        }
        else if (realType instanceof g.GraphQLEnumType) {
            // TODO
        }
        else if (realType instanceof g.GraphQLUnionType) {
            // TODO
        }
        else {
            throw new Error("Unknown type: " + type);
        }
        return {
            isArray,
            isNonNull,
            realType,
        };
    }
    mapGraphQLObjectTypeFieldArg(name, fieldName, type, objectType) {
        const info = this.mapOutput(type);
        return this.mapping.mapGraphQLObjectTypeFieldArg({
            fieldName,
            name,
            type,
            objectType,
            isArray: info.isArray,
            isNonNull: info.isNonNull,
            realType: info.realType,
        });
    }
    mapGraphQLInputObjectType(type) {
        if (this.types.some((t) => t === type)) {
            return;
        }
        this.types.push(type);
        const fields = type.getFields();
        const mapFields = Object.keys(fields).map((fieldName) => {
            const field = fields[fieldName];
            const mapType = this.mapGraphQLInputObjectTypeFieldType(fieldName, type, field.type);
            return this.mapping.mapGraphQLInputObjectTypeField({
                name: fieldName,
                objectType: type,
                type: mapType,
            });
        });
        return this.mapping.mapGraphQLInputObjectType({
            type,
            fields: mapFields,
        });
    }
    mapGraphQLObjectType(type) {
        if (this.types.some((t) => t === type)) {
            return;
        }
        this.types.push(type);
        const fields = type.getFields();
        const mapFields = Object.keys(fields).map((fieldName) => {
            const field = fields[fieldName];
            const mapType = this.mapGraphQLObjectTypeFieldType(fieldName, type, field.type);
            const mapArgs = this.mapping.mapGraphQLObjectTypeFieldArgs({
                args: field.args.map((arg) => {
                    return this.mapGraphQLObjectTypeFieldArg(arg.name, fieldName, arg.type, type);
                }),
                objectType: type,
                fieldName,
                fieldType: field.type,
            });
            return this.mapping.mapGraphQLObjectTypeField({
                args: mapArgs,
                name: fieldName,
                objectType: type,
                type: mapType,
            });
        });
        return this.mapping.mapGraphQLObjectType({
            type,
            fields: mapFields,
        });
    }
}
exports.Mapper = Mapper;
