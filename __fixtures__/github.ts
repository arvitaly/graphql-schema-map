import { buildClientSchema } from "graphql";
// tslint:disable-next-line:no-var-requires
export default buildClientSchema(require("./schema.json").data);
