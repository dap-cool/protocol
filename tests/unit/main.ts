import assert from "assert";
import * as anchor from "@project-serum/anchor";
import {
    provider,
    program,
    createUser, programForUser
} from "./util.ts";
import {Keypair} from "@solana/web3.js";

describe("dap-protocol", () => {
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // UPLOAD ASSETS ///////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // init
    it("upload assets", async () => {
        // instantiate mint
        const mint = await createUser();
        // create assets
        const shadowAccount = Keypair.generate().publicKey;
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
            .publishAsset(1, shadowAccount)
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
        // assertions
        assert.ok(actualIncrement.increment === 1);
        // invoke again & fail
        let requiredError;
        try {
            // invoke publish assets
            await program.methods
                .publishAsset(1, shadowAccount)
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
                .publishAsset(3, shadowAccount)
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
                .publishAsset(2, shadowAccount)
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
            .publishAsset(2, shadowAccount)
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
        // assertions
        assert.ok(actualIncrement.increment === 2);
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
            .publishAsset(3, shadowAccount)
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
        let actualThree = await program.account.datum.fetch(
            pdaThree
        );
        const newBalance = await provider.connection.getBalance(user02.key.publicKey);
        const diff = newBalance - balance;
        // assertions
        assert.ok(actualIncrement.increment === 3);
        assert.ok(actualThree.filtered === false);
        assert.ok(diff === 10000);
        // invoke filter asset with wrong authority & fail
        requiredError = false;
        try {
            await program02.methods
                .filterAsset(3)
                .accounts({
                    datum: pdaThree,
                    mint: mint.key.publicKey,
                    authority: user02.key.publicKey
                }).rpc();
        } catch (error) {
            requiredError = true;
        }
        assert(requiredError);
        // invoke filter asset
        await program.methods
            .filterAsset(3)
            .accounts({
                datum: pdaThree,
                mint: mint.key.publicKey,
                authority: provider.wallet.publicKey
            }).rpc();
        actualThree = await program.account.datum.fetch(
            pdaThree
        );
        // assertions
        assert.ok(actualIncrement.increment === 3);
        assert.ok(actualThree.filtered === true);
    });
});
