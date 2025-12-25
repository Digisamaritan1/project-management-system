export const mutateTours = (state, payload) => {
  state.Tours = payload;
}
export const mutateSingleTours = (state, payload) => {
    state.Tours = state?.Tours?.map((e) => {
        if (e.id === payload.id) {
            e.isCompleted = payload.isCompleted
        }
        return e;
    })
}