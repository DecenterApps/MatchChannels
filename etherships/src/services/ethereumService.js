


export const openChannel = async (markelRoot, webrtcId) => {
    const res = await window.contractInstance.openChannel(markelRoot, webrtcId, {from: window.account});

    return res;
}


export const joinChannel = async (id, markelRoot, webrtcId) => {
    const res = await window.contractInstance.joinChannel(id, markelRoot, webrtcId, {from: window.account});

    return res;
}