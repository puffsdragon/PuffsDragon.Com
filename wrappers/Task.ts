import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';
import { OP } from './Opcode';

export type TaskConfig = {
    controller: Address,
    total_checkin: number,
    last_id_checkin: number,
    last_bill_checkin: Cell,
    total_purchase: number,
    last_id_purchase: number,
    last_bill_purchase: Cell,
};

const key_size_64 = 64;
const key_size_32 = 32;

export function taskConfigToCell(config: TaskConfig): Cell {
    return beginCell()
        .storeAddress(config.controller)
        .storeInt(config.total_checkin, key_size_64)
        .storeInt(config.last_id_checkin, key_size_64)
        .storeRef(config.last_bill_checkin)
        .storeInt(config.total_purchase, key_size_64)
        .storeInt(config.last_id_purchase, key_size_64)
        .storeRef(config.last_bill_purchase)
        .storeRef(config.last_bill_purchase)
        .storeUint(Math.floor(Math.random() * 1e9), key_size_64)
        .endCell();
}

export class Task implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) { }

    static createFromAddress(address: Address) {
        return new Task(address);
    }

    static createFromConfig(config: TaskConfig, code: Cell, workchain = 0) {
        const data = taskConfigToCell(config);
        const init = { code, data };
        return new Task(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async sendCheckIn(provider: ContractProvider, via: Sender, value: bigint, playerId: number, bill: string) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().storeInt(OP.dayly_check_in, key_size_32).storeInt(0, key_size_64).storeInt(playerId, key_size_64).storeMaybeRef(beginCell().storeMaybeStringTail(bill).endCell()).endCell(),
        });
    }

    async sendPurchase(provider: ContractProvider, via: Sender, value: bigint, playerId: number, bill: string) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().storeInt(OP.purchase_package, key_size_32).storeInt(0, key_size_64).storeInt(playerId, key_size_64).storeMaybeRef(beginCell().storeMaybeStringTail(bill).endCell()).endCell(),
        });
    }

    async sendWithdraw(provider: ContractProvider, via: Sender, value: bigint, to: Address, amount: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().storeUint(OP.admin_withdraw, key_size_32).storeUint(0, key_size_64).storeAddress(to).storeInt(amount, 64).endCell(),
        });
    }

    async getGlobalData(provider: ContractProvider) {
        let res = await provider.get('get_global_data', []);
        // console.log(res)
        let controller = res.stack.readAddress();
        let total_checkin = res.stack.readBigNumber();
        let last_id_checkin = res.stack.readBigNumber();
        let last_bill_checkin = res.stack.readCell();
        let total_purchase = res.stack.readBigNumber();
        let last_id_purchase = res.stack.readBigNumber();
        let last_bill_purchase = res.stack.readCell();
        return {
            controller,
            total_checkin,
            last_id_checkin,
            last_bill_checkin,
            total_purchase,
            last_id_purchase,
            last_bill_purchase
        };
    }
}
