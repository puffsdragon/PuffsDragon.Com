import { Address, beginCell, toNano } from '@ton/core';
import { Task, TaskConfig } from '../wrappers/Task';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {

    let taskConfig: TaskConfig = {
        controller: provider.sender().address || Address.parse("0"),
        total_checkin: 0,
        last_id_checkin: 0,
        last_bill_checkin: beginCell().endCell(),
        total_purchase: 0,
        last_id_purchase: 0,
        last_bill_purchase: beginCell().endCell()
    }

    const task = provider.open(Task.createFromConfig(taskConfig, await compile('Task')));

    await task.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(task.address);
}
