export const mutateUsers = (state, payload) => {
    const {data, op} = payload;
    if(op === "added") {
        const index = state.users.findIndex((type) => type._id === data._id);
        if(index === -1){
            state.users.push(data);
        }
    } else if(op === "modified") {
        const index = state.users.findIndex((type) => type._id === data._id);
        if(index !== -1) {
            state.users[index] = data;
        }
    } else if(op === "removed") {
        const index = state.users.findIndex((type) => type._id === data._id);
        if(index !== -1) {
            state.users.splice(index, 1);
        }
    }
}
export const mutateCounts = (state, payload) => {
    state.myCounts = payload;
}