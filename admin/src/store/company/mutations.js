export const mutateCompanies = (state, payload) => {
    const {data, op} = payload;

    if(op === "added") {
        state.companies.push(data);
    } else if(op === "modified") {
        const index = state.companies.findIndex((rule) => rule._id === data._id);
        if(index !== -1) {
            state.companies[index] = data;
        }
    } else if(op === "removed") {
        const index = state.companies.findIndex((rule) => rule._id === data._id);
        if(index !== -1) {
            state.companies.splice(index, 1);
        }
    }
}