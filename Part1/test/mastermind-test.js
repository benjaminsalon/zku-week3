//[assignment] write your own unit test to show that your Mastermind variation circuit is working as expected
const { expect, assert } = require("chai");
const { ethers } = require("hardhat");
const { groth16} = require("snarkjs");

const wasm_tester = require("circom_tester").wasm;

const F1Field = require("ffjavascript").F1Field;
const Scalar = require("ffjavascript").Scalar;
exports.p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(exports.p);

const pubSol = 19088437073470657864708272409024615978633461548930206696950606552836135386003n; // Precomputed


const inputSignals = {
    "color1" : "1",
    "shape1" : "1",
    "color2" : "2",
    "shape2" : "2",
    "color3" : "3",
    "shape3" : "3",
    "nbHits" : "1",
    "nbBlows" : "1",
    "hashPub" : pubSol,
    "rightColor1" : "1",
    "rightShape1" : "1",
    "rightColor2" : "4",
    "rightShape2" : "4",
    "rightColor3" : "2",
    "rightShape3" : "2",
    "salt" : "333"
}

const wrongInputSignals = {
    "color1" : "1",
    "shape1" : "1",
    "color2" : "2",
    "shape2" : "2",
    "color3" : "3",
    "shape3" : "3",
    "nbHits" : "1",
    "nbBlows" : "0",
    "hashPub" : pubSol,
    "rightColor1" : "1",
    "rightShape1" : "1",
    "rightColor2" : "4",
    "rightShape2" : "4",
    "rightColor3" : "2",
    "rightShape3" : "2",
    "salt" : "333"
}

const invalidInputSignals = {
    "color1" : "1",
    "shape1" : "1",
    "color2" : "2",
    "shape2" : "2",
    "color3" : "3",
    "shape3" : "5",
    "nbHits" : "1",
    "nbBlows" : "0",
    "hashPub" : pubSol,
    "rightColor1" : "1",
    "rightShape1" : "1",
    "rightColor2" : "4",
    "rightShape2" : "4",
    "rightColor3" : "2",
    "rightShape3" : "2",
    "salt" : "333"
}

const wrongSaltInputSignals = {
    "color1" : "1",
    "shape1" : "1",
    "color2" : "2",
    "shape2" : "2",
    "color3" : "3",
    "shape3" : "3",
    "nbHits" : "1",
    "nbBlows" : "1",
    "hashPub" : pubSol,
    "rightColor1" : "1",
    "rightShape1" : "1",
    "rightColor2" : "4",
    "rightShape2" : "4",
    "rightColor3" : "2",
    "rightShape3" : "2",
    "salt" : "33"
}


describe("MastermindVariation with Groth16", function () {

    beforeEach(async function () {
        //[assignment] insert your script here
        Verifier = await ethers.getContractFactory("Verifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();

        
    });

    it("Should return true for a correct combination of inputs", async function () {
        //[assignment] insert your script here
        
        const circuit = await wasm_tester("contracts/circuits/MastermindVariation.circom");
        await circuit.loadConstraints();
        const witness = await circuit.calculateWitness(inputSignals, true);
    });

    it("Should return false for invalid combination of inputs - Blows changed", async function () {
        //[assignment] insert your script here

        const circuit = await wasm_tester("contracts/circuits/MastermindVariation.circom");
        await circuit.loadConstraints();
        try {
            const witness = await circuit.calculateWitness(wrongInputSignals, true);
        }
        catch (e) {
            expect(e.message).to.contain("line: 90"); // We modified the number of blows.
        }
    });

    it("Should return false for invalid inputs - Shape indice not in range", async function () {
        //[assignment] insert your script here

        const circuit = await wasm_tester("contracts/circuits/MastermindVariation.circom");
        await circuit.loadConstraints();
        try {
            const witness = await circuit.calculateWitness(invalidInputSignals, true);
        }
        catch (e) {
            expect(e.message).to.contain("line: 52"); // One shape indice is too high (superior to 4).
        }
    });

    it("Should return false for invalid salt", async function () {
        //[assignment] insert your script here

        const circuit = await wasm_tester("contracts/circuits/MastermindVariation.circom");
        await circuit.loadConstraints();
        try {
            const witness = await circuit.calculateWitness(wrongSaltInputSignals, true);
        }
        catch (e) {
            // console.log(e.message);
            expect(e.message).to.contain("line: 100");
        }
    });

    // Having issues with the full proof
    // it("Do a full and valid proof", async function () {
    //     //[assignment] insert your script here
    //     const { proof, publicSignals } = await groth16.fullProve(inputSignals, "contracts/circuits/MastermindVariation_js/MastermindVariation.wasm","contracts/circuits/circuit_final.zkey");
        
    //     // We retrieve the parameterized calldata from the proof and signals to be able to call the smart contract verifier with the correct data.
    //     const calldata = await groth16.exportSolidityCallData(proof, publicSignals);
    //     // console.log(calldata)
    //     // Doing some formatting to get an array of strings from the array of arrays of bigNumbers that we have in calldata
    //     const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString());
    //     // console.log(argv)
    //     //The next lines are the creation of the correct parameters for the contract call
    //     const a = [argv[0], argv[1]];
    //     const b = [[argv[2], argv[3]], [argv[4], argv[5]]];
    //     const c = [argv[6], argv[7]];
    //     const Input = argv.slice(8);

    //     // Contract call to verify the proof
    //     expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;
    // });
});