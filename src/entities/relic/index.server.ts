export { createRelic, deleteRelic, updateRelic } from "./api/mutations";
export { getRelic, getRelics, RELIC_TAG } from "./api/queries";
export { NO_IMAGE, type RelicInput, relicInputSchema } from "./model/schema";
export { type Relic, RELIC_KIND_LABEL, RELIC_KINDS, type RelicKind } from "./model/types";
