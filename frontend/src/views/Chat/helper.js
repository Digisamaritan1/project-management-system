import { inject } from "vue";
import { useStore } from "vuex";

export function useMainChat() {
    const companyId = inject("$companyId")
    const userId = inject("$userId")
    const {getters, dispatch} = useStore();

    function getProjects() {
        return new Promise((resolve, reject) => {
            try {
                if(getters["mainChat/mainChatProjects"]?.data?.length) {
                    resolve(true)
                } else {
                    dispatch("mainChat/setChatProjects")
                    .then(() => {
                        resolve(true)
                    })
                    .catch((error) => {
                        console.error("ERROR in set project chat:", error);
                    })
                }
            } catch (error) {
                reject(error);
            }
        })
    }

    function dispatchChats(projectId = null, sprintId = null) {
        return new Promise((resolve, reject) => {
            try {
                if(!projectId) {
                    throw "NO project";
                }
                if(getters["mainChat/chats"]?.data?.length) {
                    resolve(getters["mainChat/chats"]?.length)
                } else {
                    dispatch("mainChat/setChats", {
                        projectId: projectId,
                        companyId: companyId.value,
                        userId: userId.value,
                        sprintId
                    })
                    .then((chats) => {
                        resolve(chats);
                    })
                    .catch((error) => {
                        reject(error)
                    })
                }
            } catch (error) {
                reject(error);
            }
        })
    }

    return {
        getProjects,
        dispatchChats
    }
}