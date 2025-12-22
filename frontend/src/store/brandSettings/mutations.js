export const mutateBrandSettings = (state, payload) => {
    const {data} = payload;
    state.brandSettings = data;
}