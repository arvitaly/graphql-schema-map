import * as g from "graphql";

// tslint:disable-next-line:max-line-length
// export type GraphQLType = "Object"    | "String" | "Enum" | "Float" | "Int" | "Boolean" | "Union" | "NonNull" | "ID" | "InputObject";

export interface IGraphQLObjectTypeConfig {
    type: g.GraphQLObjectType;
    fields: any[];
}
export interface IGraphQLInputObjectTypeConfig {
    type: g.GraphQLInputObjectType;
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
export interface IGraphQLInputObjectTypeFieldConfig {
    objectType: g.GraphQLInputObjectType;
    name: string;
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
export interface IGraphQLInputObjectTypeFieldTypeConfig {
    objectType: g.GraphQLInputObjectType;
    name: string;
    type: g.GraphQLInputType;
    isArray: boolean;
    isNonNull: boolean;
    realType: g.GraphQLInputType;
}
export interface IGraphQLObjectTypeFieldArgConfig {
    objectType: g.GraphQLObjectType;
    name: string;
    fieldName: string;
    type: g.GraphQLInputType;
    isArray: boolean;
    isNonNull: boolean;
    realType: g.GraphQLInputType;
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
    mapGraphQLInputObjectType: (config: IGraphQLInputObjectTypeConfig) => any;
    mapGraphQLScalarType: (config: IGraphQLScalarTypeConfig) => any;
    mapGraphQLInterfaceType: (config: IGraphQLInterfaceTypeConfig) => any;
    mapGraphQLObjectTypeField: (config: IGraphQLObjectTypeFieldConfig) => any;
    mapGraphQLObjectTypeFieldType: (config: IGraphQLObjectTypeFieldTypeConfig) => any;
    mapGraphQLInputObjectTypeField: (config: IGraphQLInputObjectTypeFieldConfig) => any;
    mapGraphQLInputObjectTypeFieldType: (config: IGraphQLInputObjectTypeFieldTypeConfig) => any;
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
    public setMapGraphQLInputObjectType(f: (config: IGraphQLInputObjectTypeConfig) => any) {
        this.mapping.mapGraphQLInputObjectType = f;
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
    public setMapGraphQLInputObjectTypeField(f: (config: IGraphQLInputObjectTypeFieldConfig) => any) {
        this.mapping.mapGraphQLInputObjectTypeField = f;
    }
    public setMapGraphQLObjectTypeFieldType(f: (config: IGraphQLObjectTypeFieldTypeConfig) => any) {
        this.mapping.mapGraphQLObjectTypeFieldType = f;
    }
    public setMapGraphQLInputObjectTypeFieldType(f: (config: IGraphQLInputObjectTypeFieldTypeConfig) => any) {
        this.mapping.mapGraphQLInputObjectTypeFieldType = f;
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
            realType: info.realType as g.GraphQLOutputType,
        });
    }
    public mapGraphQLInputObjectTypeFieldType(
        name: string, objectType: g.GraphQLInputObjectType,
        type: g.GraphQLInputType) {
        const info = this.mapOutput(type);
        return this.mapping.mapGraphQLInputObjectTypeFieldType({
            name,
            objectType,
            type,
            isArray: info.isArray,
            isNonNull: info.isNonNull,
            realType: info.realType as g.GraphQLInputType,
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
            if (realType instanceof g.GraphQLNonNull) {
                realType = realType.ofType;
            }
            isArray = true;
        }
        if (realType instanceof g.GraphQLObjectType) {
            this.mapGraphQLObjectType(realType);
        } else if (realType instanceof g.GraphQLScalarType) {
            this.mapping.mapGraphQLScalarType({ type: realType });
        } else if (realType instanceof g.GraphQLInterfaceType) {
            this.mapping.mapGraphQLInterfaceType({ type: realType });
        } else if (realType instanceof g.GraphQLInputObjectType) {
            this.mapGraphQLInputObjectType(realType);
        } else if (realType instanceof g.GraphQLEnumType) {
            // TODO
        } else if (realType instanceof g.GraphQLUnionType) {
            // TODO
        } else {
            throw new Error("Unknown type: " + type);
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
            realType: info.realType as g.GraphQLInputType,
        });
    }
    public mapGraphQLInputObjectType(type: g.GraphQLInputObjectType) {
        if (this.types.some((t) => t === type)) {
            return;
        }
        this.types.push(type);
        const fields = type.getFields();
        const mapFields = Object.keys(fields).map((fieldName) => {
            const field = fields[fieldName];
            const mapType = this.mapGraphQLInputObjectTypeFieldType(
                fieldName,
                type,
                field.type,
            );
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
