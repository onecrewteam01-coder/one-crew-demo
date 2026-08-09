import { agentRegistry } from "./base";
import { CEOAgent } from "./ceo/CEOAgent";
import { DEVAgent } from "./developer/DEVAgent";
import { LegalAgent } from "./legal/LegalAgent";

agentRegistry.register(new CEOAgent());
agentRegistry.register(new LegalAgent());
agentRegistry.register(new DEVAgent());
export { agentRegistry };