import {computed} from 'vue';
import { useStore } from "vuex";
import * as env from '@/config/env';
import { apiRequest } from '../services/index';
export function tabSyncHelper() {
    const {getters,dispatch} = useStore();
    const getPaginatedTaskPayload = computed(() => getters['projectData/paginatedTaskPayload']);
    const gettableTaskPayload = computed(() => getters['projectData/tableTaskPayload']);
    const getChatPayload = computed(() => getters['mainChat/getChatPayload']);
    async function taskSync(tabLeaveTime) {
        try {
            const tasks = getPaginatedTaskPayload.value.length 
                ? { tasks: getPaginatedTaskPayload.value, isTable: false }
                : { tasks: gettableTaskPayload.value, isTable: true };

            if (!tasks.tasks.length) {
                return;
            }

            const uniqueTasks = [...new Map(
                tasks.tasks.map(item => [item.data?.item?.key, item])
                .filter(([key]) => key)
            ).values()];

            await Promise.allSettled(uniqueTasks.map(async (ele) => {
                try {
                    if (!ele.data) {
                        console.warn('Skipping task with invalid data');
                        return;
                    }

                    const adjustedLeaveTime = Number(tabLeaveTime) - 60000;
                    const reqObj = { 
                        ...ele.data, 
                        tabLeaveTime: adjustedLeaveTime,
                        istableTask: tasks.isTable 
                    };

                    const response = await apiRequest("post", `${env.TABSYNCTASKGET}`, reqObj);
                    if (tasks.isTable) {
                        await dispatch("projectData/tabSyncTableCommit", {
                            response,
                            payloadObjcet: ele.data
                        });    
                    } else {
                        await dispatch("projectData/tabSyncTaskCommit", {
                            response,
                            payloadObjcet: ele.data
                        });
                    }
                } catch (error) {
                    console.error(`Error processing task ${ele.data?.item?.key}:`, error.message);
                }
            }));
        } catch (error) {
            console.error('Task sync failed:', error.message);
        }
    }

    function chatSync(tabLeaveTime) {
        const adjustedLeaveTime = Number(tabLeaveTime) - 60000;
        const getQuery = [
            {
                mainChat: true,
                objId: {
                    ProjectID: getChatPayload.value.projectId
                },
                AssigneeUserId: getChatPayload.value.userId,
                updatedAt: {
                    $gte:adjustedLeaveTime,
                }
            }
        ]
        apiRequest('post',env.SET_CHATS,{findQuery: getQuery})
        .then((res) => {
            if (res.data.length) {
                dispatch("mainChat/setChatTabSync", {
                    response: res.data,
                });
            }
        })
        .catch((error) => {
            console.error(error);
        })
    }

    function tabSync() {
        let allRooms = sessionStorage.getItem('joinedRooms') || [];
        let tabLeaveTime = sessionStorage.getItem('tableaveTime');
        if (allRooms.length) {
            JSON.parse(allRooms || []).forEach((ele)=>{
                if (ele.includes('project_sprint_')) {
                    taskSync(tabLeaveTime);
                } if (ele.includes('chat_')) {
                    chatSync(tabLeaveTime);
                }
            })
        }
        
    }
    return {
        tabSync
    }
}
