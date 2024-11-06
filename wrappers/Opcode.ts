import { toNano } from "@ton/core";

export class OP {
    static dayly_check_in = 0x4E21;
    static purchase_package = 0x4E22;
    static update_controller = 0x4E23;
    static admin_withdraw = 0x4E24;
}

export class ERR {
    static unknown_op = 4001;
    static only_controller = 4002;
}
