const colors = require('colors/safe');
import InterfaceBlockchainProtocol from 'common/blockchain/interface-blockchain/protocol/Interface-Blockchain-Protocol'
import Serialization from 'common/utils/Serialization'
import consts from "consts/const_global";
import PPoWBlockchainProtocol from "common/blockchain/ppow-blockchain/protocol/PPoW-Blockchain-Protocol"

/**
 * MiniBlockchainProtocol only extends the initial Protocol in order to validate the hashAccountantTree
 */

let inheritProtocol;
if (consts.POPOW_ACTIVATED) inheritProtocol = PPoWBlockchainProtocol;
else inheritProtocol = InterfaceBlockchainProtocol;

class MiniBlockchainProtocol extends inheritProtocol{

    constructor(blockchain){
        super(blockchain)
    }

    _validateBlockchainHeader(data){

        InterfaceBlockchainProtocol.prototype._validateBlockchainHeader.call(this, data);

        if (typeof data.header.data.hashAccountantTree === 'string') data.header.data.hashAccountantTree = Serialization.fromBase(data.header.data.hashAccountantTree);
        else data.header.data.hashAccountantTree = new Buffer(data.header.data.hashAccountantTree);

    }

    _initializeNewSocket(nodesListObject) {

        let socket = nodesListObject.socket;

        inheritProtocol.prototype._initializeNewSocket.call(this, nodesListObject);

        /**
         * Get difficulty
         */
        socket.on("get/blockchain/light/get-light-settings", async (data)=>{

            try{

                if (data.height === undefined) data.height = -1;

                if (typeof data.height !== "number")
                    throw "data.height is not a number";

                if (this.blockchain.blocks.length < data.height) throw "height is not valid";
                if (data.height < -1) throw "height is not valid";

                if (this.blockchain.agent.light === true)
                    if (this.blockchain.blocks.length - consts.POW_PARAMS.VALIDATE_LAST_BLOCKS -2 > data.height) throw "height is to large for request";

                let difficultyTarget = this.blockchain.getDifficultyTarget(data.height);
                let timestamp = this.blockchain.getTimeStamp(data.height);
                let hashPrev = this.blockchain.getHashPrev(data.height);

                console.log(colors.yellow("difficultyTarget data"), difficultyTarget);
                console.log(colors.yellow("difficultyTarget data"), difficultyTarget);
                console.log(colors.yellow("difficultyTarget data"), difficultyTarget);
                console.log(colors.yellow("difficultyTarget data"), difficultyTarget);
                console.log(colors.yellow("difficultyTarget data"), difficultyTarget);

                socket.node.sendRequest("get/blockchain/light/get-light-settings/" + (data.height || -1), {
                    result: difficultyTarget !== null ? true : false,
                    difficultyTarget: difficultyTarget,
                    timeStamp: timestamp,
                    hashPrev: hashPrev,
                });


            } catch (exception){

                console.log(colors.red("Socket Error - get/blockchain/light/get-light-settings", exception), data);

                socket.node.sendRequest("get/blockchain/light/get-light-settings/" + (data.height || -1), {
                    result: false,
                    message: exception.toString()
                });

            }

        });


    }

}

export default MiniBlockchainProtocol