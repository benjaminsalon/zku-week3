pragma circom 2.0.0;

// [assignment] implement a variation of mastermind from https://en.wikipedia.org/wiki/Mastermind_(board_game)#Variation as a circuit

include "../../node_modules/circomlib/circuits/poseidon.circom";
include "../../node_modules/circomlib/circuits/comparators.circom";


template MastermindVariation() {
    // Let's do the Royale Mastermind -> 5 colors and 5 shapes, 3 holes
    signal input color1;
    signal input shape1;
    signal input color2;
    signal input shape2;
    signal input color3;
    signal input shape3;

    signal input nbHits;
    signal input nbBlows;

    //The hash of the solution to avoid brute force
    signal input hashPub;

    signal input rightColor1;
    signal input rightShape1;
    signal input rightColor2;
    signal input rightShape2;
    signal input rightColor3;
    signal input rightShape3;

    signal input salt;

    signal output pubSolOut;

    // Add a constraint to verify if the input is sane
    var colors[3] = [color1, color2, color3];
    var shapes[3] = [shape1, shape2, shape3];
    component lessThan[6];

    var i = 0;
    var j = 0;
    
    for (i=0; i<3; i++){
        lessThan[2*i] = LessThan(4);
        lessThan[2*i].in[0] <== colors[i];
        lessThan[2*i].in[1] <== 5;
        lessThan[2*i].out === 1;

        lessThan[2*i+1] = LessThan(4);
        lessThan[2*i+1].in[0] <== shapes[i];
        lessThan[2*i+1].in[1] <== 5;
        lessThan[2*i+1].out === 1;
    }

    // We will work on a grid of 5*5

    var inputsComputed[3] = [color1*5+shape1, color2*5+shape2, color3*5+shape3];
    var rightInputsComputed[3] = [rightColor1*5+rightShape1, rightColor2*5+rightShape2, rightColor3*5+rightShape3];


    // Let's count the hits and blows (wrong vocabulary but easier than black and whites I find)
    var nbHitsReal = 0;
    var nbBlowsReal = 0;

    component equals[9];
    

    for (i = 0; i <3; i++) {
        for (j = 0; j<3; j++) {
            equals[i*3+j] = IsEqual();
            equals[i*3+j].in[0] <== inputsComputed[i];
            equals[i*3+j].in[1] <== rightInputsComputed[j];
            if (i==j) {
                nbHitsReal += equals[i*3+j].out;
            }
            else {
                nbBlowsReal += equals[i*3+j].out;
            }    
        }
    }
    // Check if the hits and blows are correct
    component equalHit = IsEqual();
    equalHit.in[0] <== nbHits;
    equalHit.in[1] <== nbHitsReal;
    equalHit.out === 1;

    component equalBlow = IsEqual();
    equalBlow.in[0] <== nbBlows;
    equalBlow.in[1] <== nbBlowsReal;
    equalBlow.out === 1;

    // Verify the hash

    component poseidon = Poseidon(4);
    poseidon.inputs[0] <== salt;
    poseidon.inputs[1] <== rightInputsComputed[0];
    poseidon.inputs[2] <== rightInputsComputed[1];
    poseidon.inputs[3] <== rightInputsComputed[2];

    poseidon.out === hashPub;
    pubSolOut <== poseidon.out;
}

component main {public [color1,shape1,color2,shape2,color3,shape3,nbHits,nbBlows,hashPub]}= MastermindVariation();