import assert from "assert";
import * as anchor from "@project-serum/anchor";
import {
    provider,
    program,
    createUser, programForUser
} from "./util.ts";

describe("dap-protocol", () => {
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // UPLOAD ASSETS ///////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // init
    it("upload assets", async () => {
        // instantiate mint
        const mint = await createUser();
        // create assets
        const url = Buffer.from("u".repeat(78));
        // derive tariff
        let pdaTariff, _;
        [pdaTariff, _] = await anchor.web3.PublicKey.findProgramAddress(
            [
                Buffer.from("tarifftariff")
            ],
            program.programId
        )
        // derive increment
        let pdaIncrement;
        [pdaIncrement, _] = await anchor.web3.PublicKey.findProgramAddress(
            [
                mint.key.publicKey.toBuffer(),
                provider.wallet.publicKey.toBuffer(),
            ],
            program.programId
        );
        // derive datum one
        let pdaOne;
        [pdaOne, _] = await anchor.web3.PublicKey.findProgramAddress(
            [
                mint.key.publicKey.toBuffer(),
                provider.wallet.publicKey.toBuffer(),
                Buffer.from([1])
            ],
            program.programId
        );
        // invoke init tariff
        await program.methods
            .initializeTariff()
            .accounts({
                tariff: pdaTariff,
                payer: provider.wallet.publicKey,
            }).rpc();
        // fetch account
        let actualTariff = await program.account.tariff.fetch(
            pdaTariff
        );
        // assertions
        assert.ok(actualTariff.tariff.toNumber() === 0);
        // invoke init increment
        await program.methods
            .initializeIncrement()
            .accounts({
                increment: pdaIncrement,
                mint: mint.key.publicKey,
                payer: provider.wallet.publicKey,
            }).rpc();
        // invoke publish assets
        await program.methods
            .publishAssets(1, url)
            .accounts({
                datum: pdaOne,
                increment: pdaIncrement,
                mint: mint.key.publicKey,
                tariff: pdaTariff,
                tariffAuthority: provider.wallet.publicKey,
                payer: provider.wallet.publicKey,
            }).rpc();
        // fetch accounts
        let actualIncrement = await program.account.increment.fetch(
            pdaIncrement
        );
        let actualOne = await program.account.datum.fetch(
            pdaOne
        );
        // assertions
        assert.ok(actualIncrement.increment === 1);
        assert.ok(actualOne.seed === 1);
        // invoke again & fail
        let requiredError;
        try {
            // invoke publish assets
            await program.methods
                .publishAssets(1, url)
                .accounts({
                    datum: pdaOne,
                    increment: pdaIncrement,
                    mint: mint.key.publicKey,
                    tariff: pdaTariff,
                    tariffAuthority: provider.wallet.publicKey,
                    payer: provider.wallet.publicKey,

                }).rpc();
        } catch (error) {
            requiredError = true;
        }
        assert(requiredError);
        // invoke with skipped seed
        // derive datum three
        let pdaThree;
        [pdaThree, _] = await anchor.web3.PublicKey.findProgramAddress(
            [
                mint.key.publicKey.toBuffer(),
                provider.wallet.publicKey.toBuffer(),
                Buffer.from([3])
            ],
            program.programId
        );
        requiredError = false;
        try {
            // invoke publish assets
            await program.methods
                .publishAssets(3, url)
                .accounts({
                    datum: pdaThree,
                    increment: pdaIncrement,
                    mint: mint.key.publicKey,
                    tariff: pdaTariff,
                    tariffAuthority: provider.wallet.publicKey,
                    payer: provider.wallet.publicKey,

                }).rpc();
        } catch (error) {
            requiredError = true;
        }
        assert(requiredError);
        // derive datum two
        let pdaTwo;
        [pdaTwo, _] = await anchor.web3.PublicKey.findProgramAddress(
            [
                mint.key.publicKey.toBuffer(),
                provider.wallet.publicKey.toBuffer(),
                Buffer.from([2])
            ],
            program.programId
        );
        // invoke with wrong authority & fail
        requiredError = false;
        const user02 = await createUser();
        try {
            // invoke publish assets
            await program.methods
                .publishAssets(2, url)
                .accounts({
                    datum: pdaTwo,
                    increment: pdaIncrement,
                    mint: mint.key.publicKey,
                    tariff: pdaTariff,
                    tariffAuthority: user02.key.publicKey,
                    payer: provider.wallet.publicKey,

                }).rpc();
        } catch (error) {
            requiredError = true;
        }
        assert(requiredError);
        // next seed
        // invoke publish assets
        await program.methods
            .publishAssets(2, url)
            .accounts({
                datum: pdaTwo,
                increment: pdaIncrement,
                mint: mint.key.publicKey,
                tariff: pdaTariff,
                tariffAuthority: provider.wallet.publicKey,
                payer: provider.wallet.publicKey,

            }).rpc();
        // fetch accounts
        actualIncrement = await program.account.increment.fetch(
            pdaIncrement
        );
        const actualTwo = await program.account.datum.fetch(
            pdaTwo
        );
        // assertions
        assert.ok(actualIncrement.increment === 2);
        assert.ok(actualTwo.seed === 2);
        // transfer tariff authority
        await program.methods
            .transferTariffAuthority()
            .accounts({
                tariff: pdaTariff,
                from: provider.wallet.publicKey,
                to: user02.key.publicKey
            })
            .rpc()
        // fetch account
        actualTariff = await program.account.tariff.fetch(
            pdaTariff
        );
        // assertions
        assert.ok(actualTariff.authority.toString() === user02.key.publicKey.toString());
        assert.ok(actualTariff.tariff.toNumber() === 0);
        // invoke with wrong authority & fail
        requiredError = false;
        try {
            await program.methods
                .transferTariffAuthority()
                .accounts({
                    tariff: pdaTariff,
                    from: provider.wallet.publicKey,
                    to: user02.key.publicKey
                })
                .rpc()
        } catch (error) {
            requiredError = true;
        }
        assert(requiredError);
        // invoke set new tariff
        const program02 = programForUser(user02);
        await program02.methods
            .setNewTariff(new anchor.BN(10000))
            .accounts({
                tariff: pdaTariff,
                tariffAuthority: user02.key.publicKey,
            })
            .rpc()
        // fetch account
        actualTariff = await program.account.tariff.fetch(
            pdaTariff
        );
        // assertions
        assert.ok(actualTariff.tariff.toNumber() === 10000);
        // invoke with wrong authority & fail
        requiredError = false;
        try {
            await program.methods
                .setNewTariff(new anchor.BN(20000))
                .accounts({
                    tariff: pdaTariff,
                    tariffAuthority: provider.wallet.publicKey,
                })
                .rpc()
        } catch (error) {
            requiredError = true;
        }
        assert(requiredError);
        // fetch account
        actualTariff = await program.account.tariff.fetch(
            pdaTariff
        );
        // assertions
        assert.ok(actualTariff.tariff.toNumber() === 10000);
        // invoke publish assets
        const balance = await provider.connection.getBalance(user02.key.publicKey);
        await program.methods
            .publishAssets(3, url)
            .accounts({
                datum: pdaThree,
                increment: pdaIncrement,
                mint: mint.key.publicKey,
                tariff: pdaTariff,
                tariffAuthority: user02.key.publicKey,
                payer: provider.wallet.publicKey,
            }).rpc();
        // fetch accounts
        actualIncrement = await program.account.increment.fetch(
            pdaIncrement
        );
        const actualThree = await program.account.datum.fetch(
            pdaThree
        );
        const newBalance = await provider.connection.getBalance(user02.key.publicKey);
        const diff = newBalance - balance;
        // assertions
        assert.ok(actualIncrement.increment === 3);
        assert.ok(actualThree.seed === 3);
        assert.ok(diff === 10000);
    });
});
