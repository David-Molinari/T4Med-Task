import React, { useState, useEffect } from "react";
import './Modal.css';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import { hexToRgbA } from './ModalUtils';

function ModalComp(props) {

    const toggle = () => props.setModal({...props.modal, open: false});

    const [color, setColor] = useState("")

    useEffect(()=> {
        if (props.modal.open == true) {
            let gRs = props.glucoseRanges
            let gL0 = props.modal.data.glucoseLevelNum
            for (let i = 0; i < gRs.length; i++) {
                if (gL0 >= gRs[i][0] && gL0 <= gRs[i][1]) {
                    setColor(hexToRgbA(gRs[i][2]))
                }
            }
        }
    }, [props.modal])

    return (
        <Modal isOpen={props.modal.open} className="Modal">
            <ModalHeader 
                id="ModalHeader" 
                toggle={toggle}
            >
                Glucose Reading
            </ModalHeader>
            <ModalBody 
                className="ModalBody"
                style={{backgroundColor: color}}
            >
                <div className="ModalBodyInnerCont">
                    <div 
                        id="ModalBodyTopRow"
                        className="ModalRow"
                    >
                        <h3 className="ModalLabel">
                            Glucose Level:
                        </h3>
                        <h5 className="ModalEntry">
                            {props.modal.data.glucoseLevel}
                        </h5>
                    </div>
                    <div className="ModalRow">
                        <h3 className="ModalLabel">
                            Result Date:
                        </h3>
                        <h5 className="ModalEntry">
                            {props.modal.data.resultDate}
                        </h5>
                    </div>
                    <div className="ModalRow">
                        <h3 className="ModalLabel">
                            Source:
                        </h3>
                        <h5 className="ModalEntry">
                            {props.modal.data.source}
                        </h5>
                    </div>
                    <div className="ModalRow">
                        <h3 className="ModalLabel">
                            Result ID:
                        </h3>
                        <h5 
                            id="ResultIdEntry"
                            className="ModalEntry"
                        >
                            {props.modal.data.resultId}
                        </h5>
                    </div>
                </div>
            </ModalBody>
        </Modal>
    )
}

export default ModalComp;