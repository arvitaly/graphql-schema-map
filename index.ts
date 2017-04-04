import * as g from "graphql";

// tslint:disable-next-line:max-line-length
// export type GraphQLType = "Object"    | "String" | "Enum" | "Float" | "Int" | "Boolean" | "Union" | "NonNull" | "ID" | "InputObject";

type GraphQLAnyType = "any";

export interface IGraphQLObjectTypeConfig {
    type: g.GraphQLObjectType;
    fields: any[];
}
export interface IGraphQLScalarTypeConfig {
    type: g.GraphQLScalarType;
}
export interface IGraphQLInterfaceTypeConfig {
    type: g.GraphQLInterfaceType;
}
export interface IGraphQLObjectTypeFieldConfig {
    objectType: g.GraphQLObjectType;
    name: string;
    args: any[];
    type: any;
}
export interface IGraphQLObjectTypeFieldTypeConfig {
    objectType: g.GraphQLObjectType;
    name: string;
    type: g.GraphQLOutputType;
    isArray: boolean;
    isNonNull: boolean;
    realType: g.GraphQLOutputType;
}
export interface IGraphQLObjectTypeFieldArgConfig {
    objectType: g.GraphQLObjectType;
    name: string;
    fieldName: string;
    type: g.GraphQLInputType;
    isArray: boolean;
    isNonNull: boolean;
    realType: g.GraphQLOutputType;
}
export interface IGraphQLSchemaConfig {
    schema: g.GraphQLSchema;
    query: any;
    mutation: any;
}
export interface IGraphQLObjectTypeFieldArgsConfig {
    objectType: g.GraphQLObjectType;
    fieldName: string;
    fieldType: g.GraphQLOutputType;
    args: any[];

}
export interface IMapper {
    mapGraphQLSchema: (config: IGraphQLSchemaConfig) => any;
    mapGraphQLObjectType: (config: IGraphQLObjectTypeConfig) => any;
    mapGraphQLScalarType: (config: IGraphQLScalarTypeConfig) => any;
    mapGraphQLInterfaceType: (config: IGraphQLInterfaceTypeConfig) => any;
    mapGraphQLObjectTypeField: (config: IGraphQLObjectTypeFieldConfig) => any;
    mapGraphQLObjectTypeFieldType: (config: IGraphQLObjectTypeFieldTypeConfig) => any;
    mapGraphQLObjectTypeFieldArg: (config: IGraphQLObjectTypeFieldArgConfig) => any;
    mapGraphQLObjectTypeFieldArgs: (config: IGraphQLObjectTypeFieldArgsConfig) => any;
}
export type IMapperOptional = {[P in keyof IMapper]?: IMapper[P]};
export default (schema: g.GraphQLSchema, mapping: IMapperOptional) => {
    const mapper = new Mapper(schema, mapping as any);
    return mapper.map();
};

// tslint:disable-next-line:max-line-length
const keys = ["mapGraphQLSchema", "mapGraphQLObjectType", "mapGraphQLObjectTypeField", "mapGraphQLObjectTypeFieldType", "mapGraphQLObjectTypeFieldArg"];

export class Mapper {
    protected mapping: IMapper = {
        mapGraphQLObjectType: (config) => config,
        mapGraphQLScalarType: (config) => config,
        mapGraphQLInterfaceType: (config) => config,
        mapGraphQLObjectTypeField: (config) => config,
        mapGraphQLObjectTypeFieldArg: (config) => config,
        mapGraphQLObjectTypeFieldType: (config) => config,
        mapGraphQLSchema: (config) => config,
        mapGraphQLObjectTypeFieldArgs: (config) => config,
    };
    protected types: Array<g.GraphQLObjectType | g.GraphQLInputObjectType> = [];
    constructor(protected schema: g.GraphQLSchema, protected mapp: IMapperOptional) {
        keys.map((f) => {
            if ((this.mapp as any)[f]) {
                (this.mapping as any)[f] = (this.mapp as any)[f];
            }
        });
    }
    public map() {
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
    public setMapGraphQLObjectType(f: (config: IGraphQLObjectTypeConfig) => any) {
        this.mapping.mapGraphQLObjectType = f;
    }
    public setMapGraphQLScalarType(f: (config: IGraphQLScalarTypeConfig) => any) {
        this.mapping.mapGraphQLScalarType = f;
    }
    public setMapGraphQLInterfaceType(f: (config: IGraphQLInterfaceTypeConfig) => any) {
        this.mapping.mapGraphQLInterfaceType = f;
    }
    public setMapGraphQLObjectTypeField(f: (config: IGraphQLObjectTypeFieldConfig) => any) {
        this.mapping.mapGraphQLObjectTypeField = f;
    }
    public setMapGraphQLObjectTypeFieldType(f: (config: IGraphQLObjectTypeFieldTypeConfig) => any) {
        this.mapping.mapGraphQLObjectTypeFieldType = f;
    }
    public setMapGraphQLObjectTypeFieldArg(f: (config: IGraphQLObjectTypeFieldArgConfig) => any) {
        this.mapping.mapGraphQLObjectTypeFieldArg = f;
    }
    public setMapGraphQLObjectTypeFieldArgs(f: (config: IGraphQLObjectTypeFieldArgsConfig) => any) {
        this.mapping.mapGraphQLObjectTypeFieldArgs = f;
    }
    public mapGraphQLObjectTypeFieldType(name: string, objectType: g.GraphQLObjectType, type: g.GraphQLOutputType) {
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
    public mapOutput(type: g.GraphQLOutputType | g.GraphQLInputType) {
        let realType = type;
        let isArray = false;
        let isNonNull = false;
        if (realType instanceof g.GraphQLNonNull) {
            realType = realType.ofType;
            isNonNull = true;
        }
        if (realType instanceof g.GraphQLList) {
            realType = realType.ofType;
            isArray = true;
        }
        if (realType instanceof g.GraphQLObjectType) {
            this.mapGraphQLObjectType(realType);
        } else if (realType instanceof g.GraphQLScalarType) {
            this.mapping.mapGraphQLScalarType({ type: realType });
        } else if (realType instanceof g.GraphQLInterfaceType) {
            this.mapping.mapGraphQLInterfaceType({ type: realType });
        } else {
            throw new Error("Unknown type: " + realType);
        }
        return {
            isArray,
            isNonNull,
            realType,
        };
    }
    public mapGraphQLObjectTypeFieldArg(
        name: string, fieldName: string,
        type: g.GraphQLInputType, objectType: g.GraphQLObjectType) {
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
    public mapGraphQLObjectType(type: g.GraphQLObjectType) {
        if (this.types.some((t) => t === type)) {
            return;
        }
        this.types.push(type);
        const fields = type.getFields();
        const mapFields = Object.keys(fields).map((fieldName) => {
            const field = fields[fieldName];

            const mapType = this.mapGraphQLObjectTypeFieldType(
                fieldName,
                type,
                field.type,
            );

            const mapArgs = this.mapping.mapGraphQLObjectTypeFieldArgs({
                args: field.args.map((arg) => {
                    return this.mapGraphQLObjectTypeFieldArg(
                        arg.name,
                        fieldName,
                        arg.type,
                        type,
                    );
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
