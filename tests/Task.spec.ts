import { Blockchain, printTransactionFees, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { beginCell, Cell, toNano } from '@ton/core';
import { Task, TaskConfig } from '../wrappers/Task';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

describe('Task', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('Task');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let task: SandboxContract<Task>;
    let player1: SandboxContract<TreasuryContract>;
    let player2: SandboxContract<TreasuryContract>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        deployer = await blockchain.treasury('deployer');
        player1 = await blockchain.treasury('player1');
        player2 = await blockchain.treasury('player2')

        let taskConfig: TaskConfig = {
            controller: deployer.address,
            total_checkin: 0,
            last_id_checkin: 0,
            last_bill_checkin: beginCell().endCell(),
            total_purchase: 0,
            last_id_purchase: 0,
            last_bill_purchase: beginCell().endCell()
        }

        task = blockchain.openContract(Task.createFromConfig(taskConfig, code));

        const deployResult = await task.sendDeploy(deployer.getSender(), toNano('3'));
        // printTransactionFees(deployResult.transactions)
        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: task.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        let getGlobalData = await task.getGlobalData();
        console.log("getGlobalData", getGlobalData);
    });

    it('check-in', async () => {
        let checkin = await task.sendCheckIn(player1.getSender(), toNano("0.002"), 1231423, "billId")
        let checkin2 = await task.sendCheckIn(player1.getSender(), toNano("0.002"), 3453456, "bssdillId")
        // printTransactionFees(checkin.transactions)
        let getGlobalData = await task.getGlobalData();
        console.log("getGlobalData", getGlobalData);
    });

    it('purchase', async () => {
        let checkin = await task.sendPurchase(player1.getSender(), toNano("0.002"), 1231423, "billId")
        let checkin2 = await task.sendPurchase(player1.getSender(), toNano("0.002"), 3453456, "bssdillId")
        printTransactionFees(checkin.transactions)
        let getGlobalData = await task.getGlobalData();
        console.log("getGlobalData", getGlobalData);
    });

    it('admin withdraw', async () => {
        const withdraw = await task.sendWithdraw(deployer.getSender(), toNano("0.01"), deployer.getSender().address, toNano('1'))
        // expect(withdraw.transactions).toHaveTransaction({
        //     on: task.address,
        //     success: true,
        // });
        // expect(
        //     await blockchain
        //         .openContract(JettonWallet.createFromAddress(await jettonMinter.getWalletAddressOf(users[0].address)))
        //         .getJettonBalance()
        // ).toEqual(toNano('10'));

        printTransactionFees(withdraw.transactions)
    });
});
