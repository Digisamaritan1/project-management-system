export const setChargeBeePrice = (state, payload) => {
    state.chargeBeePrice = payload;
}

export const setplanFeatureDisplay = (state, payload) => {
    state.planFeatureDisplay = payload;
}

export const setplanFeature = (state, payload) => {
    state.planFeature = payload;
}


export const setPlanFeatureDisplayAction = (state,payload) => {
    let ind = state.planFeatureDisplay.findIndex((x)=> x.planName === payload.planName);
    state.planFeatureDisplay[ind] = payload;
}

export const setPlanFeatureAction = (state,payload) => {
    let ind = state.planFeature.findIndex((x)=> x.planName === payload.planName);
    state.planFeature[ind] = payload;
}


export const setChargeBeePriceAction = (state,payload) => {
    let ind = state.chargeBeePrice.findIndex((x)=> x.planName === payload.planName);
    if (payload.key == 'status') {
        state.chargeBeePrice[ind].status = payload.status;
    } else if (payload.key == 'both') {
        state.chargeBeePrice[ind].sortIndex = payload.sortIndex;
        state.chargeBeePrice[ind].status = payload.status;
    } else {
        state.chargeBeePrice[ind].sortIndex = payload.sortIndex;
    }
}