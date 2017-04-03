import * as g from "graphql";

// tslint:disable-next-line:max-line-length
// export type GraphQLType = "Object"    | "String" | "Enum" | "Float" | "Int" | "Boolean" | "Union" | "NonNull" | "ID" | "InputObject";

export interface IGraphQLObjectTypeConfig {
    type: g.GraphQLObjectType;
    fields: any[];
}
export interface IGraphQLScalarTypeConfig {
    type: g.GraphQLScalarType;
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
}
export interface IGraphQLObjectTypeFieldArgConfig {
    objectType: g.GraphQLObjectType;
    name: string;
    fieldName: string;
    type: g.GraphQLInputType;
}
export interface IGraphQLSchemaConfig<Q, M> {
    schema: g.GraphQLSchema;
    query: Q;
    mutation: M;
}
export interface IMapper {
    mapGraphQLSchema: (config: IGraphQLSchemaConfig<any, any>) => any;
    mapGraphQLObjectType: (config: IGraphQLObjectTypeConfig) => any;
    mapGraphQLScalarType: (config: IGraphQLScalarTypeConfig) => any;
    mapGraphQLObjectTypeField: (config: IGraphQLObjectTypeFieldConfig) => any;
    mapGraphQLObjectTypeFieldType: (config: IGraphQLObjectTypeFieldTypeConfig) => any;
    mapGraphQLObjectTypeFieldArg: (config: IGraphQLObjectTypeFieldArgConfig) => any;
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
        mapGraphQLObjectType: (config) => config.type,
        mapGraphQLScalarType: (config) => config.type,
        mapGraphQLObjectTypeField: (config) => config.type,
        mapGraphQLObjectTypeFieldArg: (config) => config.type,
        mapGraphQLObjectTypeFieldType: (config) => config.type,
        mapGraphQLSchema: (config) => config.schema,
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
    public setMapGraphQLObjectTypeField(f: (config: IGraphQLObjectTypeFieldConfig) => any) {
        this.mapping.mapGraphQLObjectTypeField = f;
    }
    public setMapGraphQLObjectTypeFieldType(f: (config: IGraphQLObjectTypeFieldTypeConfig) => any) {
        this.mapping.mapGraphQLObjectTypeFieldType = f;
    }
    public setMapGraphQLObjectTypeFieldArg(f: (config: IGraphQLObjectTypeFieldArgConfig) => any) {
        this.mapping.mapGraphQLObjectTypeFieldArg = f;
    }
    public mapGraphQLObjectType(type: g.GraphQLObjectType) {
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
