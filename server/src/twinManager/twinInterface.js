

const implement = (state) => {


    const setFeatures = (features) => {

        for (i in state.features) {
            state.features[i] = features[i];
        }

        if(state.runPostUpdateFunctions){
            state.runPostUpdateFunctions()
        }

        //shouldAlarmFire(state.features.air);
    };

    const getFeatures = () => {
        return { ...state.features };
    };

    const setName = (name) => {
        state.twinName = name;
    };

    const getName = () => {
        return state.twinName;
    };



    return {
        setFeatures,
        setName,
        getName,
        getFeatures

    };

};

module.exports = {
    implement
};