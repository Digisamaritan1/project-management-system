<template>
    <div class="d-flex w-100 h-100">
        <div class="border-right chat__chanel-icons">
            <div class="border-radius-5-px d-flex align-items-center bg-light-gray justify-content-center m-15px h-35px" v-if="clientWidth <= 1200" @click="$emit('hide')">
                <img :src="sidebarArrowIcon" alt="sidebarArrowIcon">
            </div>
            <div :title="!project?.default ? currentCompanyName : 'Chats'"
                v-for="project in projects" :key="project._id"
                @click="setProject(project)"
                class="position-re"
            >
                <div class="bg-blue position-ab border-right-radius-5-px h-100 selected__projectid-div" v-if="selectedProject._id === project._id"></div>
                <div class="d-flex cursor-pointer align-items-center justify-content-center border-radius-5-px  white position-re m-15px h-35px" :class="{'bg-blue' : selectedProject._id === project._id && project?.default,'border-2px-blue' : selectedProject._id === project._id && !project?.default && currentCompanyImage,'border-2': (selectedProject._id !== project._id && project?.default)}">
                    <template v-if="project?.default">
                        <img :src="allChats" alt="All chats" class="filter-shadow-light all_chats-img">
                        <span v-if="checkAllCount(project)" class="notification-tick blinking checkall__count">{{ checkAllCount(project) > 99 ? "+99" :checkAllCount(project) }}</span>
                    </template>
                    <template v-else>
                        <template v-if="currentCompanyImage">
                            <img v-if="currentCompanyImage?.includes('http')" class="profile-image border-radius-5-px w-100 h-100" :src="currentCompanyImage" :alt="currentCompanyName">
                            <WasabiImageComp v-else class="profile-image border-radius-5-px w-100 h-100" :data="{url: currentCompanyImage, filename: currentCompanyImage.split('/').pop(), extension: currentCompanyImage.split('/').pop().split('.').pop()}"/>
                        </template>
                        <template v-else-if="currentCompanyName">
                            <span class="bg-blue company_latter" :class="{'white': selectedProject._id === project._id}">{{currentCompanyName.charAt(0)}}</span>
                        </template>
                        <span v-if="checkAllCount(project)" class="notification-tick blinking checkall__count">{{ checkAllCount(project) > 99 ? "+99" :checkAllCount(project) }}</span>
                    </template>
                </div>
            </div>
        </div>
        <div class="chanel__detail-icon" :class="[{'border-right' : allowChannelFeature}]" v-if="!loadingChats">
            <div class="d-flex align-items-center p0x-10px chanel__searchinput-wrapper" :class="[{'bg-light-gray': selectedProject?.default ? allowOneToOneChatFeature : allowChannelFeature}]">
                <template v-if="selectedProject?.default">
                    <InputText
                        v-if="allowOneToOneChatFeature"
                        v-model="searchChat"
                        :placeholder="`${$t('PlaceHolder.search_here')}...`"
                        class="chanel__searchinput"
                        :isOutline="false"
                    />
                </template>
                <template v-else>
                    <div class="d-flex align-items-center justify-content-between w-100" v-if="allowChannelFeature">
                        <span>{{selectedProject?.ProjectName}}</span>

                        <DropDown :title="selectedProject.ProjectName" v-if="selectedProject?._id && checkPermission('chat.chat_category') === true">
                            <template #button>
                                <img ref="createChannelBtn" src="@/assets/images/svg/horizontalDots.svg" alt="dots" class="vertical-middle ml-6px">
                            </template>
                            <template #options>
                                <DropDownOption @click="$refs.createChannelBtn.click(), showCreateCategory = true">
                                    <div class="d-flex align-items-center project-mobile-desc">
                                        <img :src="createCategory" alt="createCategory" class="mr-10px">
                                        {{$t('Category.create_category')}}
                                    </div>
                                </DropDownOption>
                            </template>
                        </DropDown>
                    </div>
                </template>
            </div>
            <div class="overflow-y-auto style-scroll chanel__defultchat-wrapper">
                <!-- CHANNEL CHAT -->
                <template v-if="!selectedProject?.default">
                    <div v-if="allowChannelFeature">
                        <template v-if="!loadingSprints">
                            <template v-if="category && Object.keys(category).length">
                                <TransitionGroup>
                                    <div v-for="folder in category" :key="folder.folderId">
                                        <ChatListItem
                                            :key="folder.folderId"
                                            :item="folder"
                                            :active="Object.values(folder?.sprintsObj || {})?.map((x) => x?.id).includes(selectedChat?.id)"
                                            @click="(e) => e ? setActiveChat(e) : folder.isExpanded = !folder.isExpanded"
                                            @toggle="folder.isExpanded = !folder.isExpanded"
                                            type="category"
                                            :selectedProject="selectedProject"
                                        >
                                            <template #options>
                                                <div class="d-flex align-items-center">
                                                    <Transition>
                                                        <div v-if="checkCount(folder)" class="red border-radius-1 font-size-12 bg-transparent p2x-5px border-red">
                                                            {{(checkCount(folder)) > 99 ? "+99" : checkCount(folder)}}
                                                        </div>
                                                    </Transition>
                                                    <DropDown :id="`category_${folder.folderId}`" :title="folder.name" v-if="checkPermission('chat.chat_channel') === true">
                                                        <template #button>
                                                            <img :ref="`category_${folder.folderId}Ref`" src="@/assets/images/svg/horizontalDots.svg" alt="dots" class="vertical-middle ml-6px">
                                                        </template>
                                                        <template #options>
                                                            <DropDownOption @click="$refs[`category_${folder.folderId}Ref`][0].click(), folderId=folder.folderId, showCreateChannel = true">
                                                                <div class="d-flex align-items-center project-mobile-desc">
                                                                    <img :src="addLogo" alt="addLogo" class="mr-10px">
                                                                    {{$t('Category.create_channel')}}
                                                                </div>
                                                            </DropDownOption>
                                                        </template>
                                                    </DropDown>
                                                </div>
                                            </template>
                                        </ChatListItem>
                                    </div>
                                </TransitionGroup>
                            </template>
                            <template v-else>
                                <div class="cursor-default text-center font-weight-normal mt-10px">
                                    {{$t('Category.no_chat_found')}}
                                </div>
                            </template>
                        </template>
                        <template v-else>
                            <template v-for="i in Math.round(Math.random() * (8-3) + 3)" :key="i">
                                <Skelaton style="height: 40px;" class="border-radius-5-px mb-5px"/>
                                <template v-if="[3,5].includes(i)">
                                    <Skelaton style="height: 40px;" class="border-radius-5-px mb-5px ml-25px" v-for="j in Math.round(Math.random() * (5-0) + 0)" :key="j"/>
                                </template>
                            </template>
                        </template>
                    </div>
                    <div v-else>
                        <UpgradePlan
                            :buttonText="$t('Upgrades.upgrade_your_plan')"
                            :lastTitle="$t('Upgrades.unlock_channel')"
                            :secondTitle="$t('Upgrades.unlimited')"
                            :firstTitle="$t('Upgrades.upgrade_to')"
                            :message="$t('Upgrades.the_feature_not_available')"
                        />
                    </div>
                </template>

                <!-- DEFAULT CHAT -->
                <template v-else>
                    <template v-if="allowOneToOneChatFeature">
                        <h4 class="m-0 font-size-14 font-weight-500 gray63 fav__h4">{{$t('Chat.chats')}}</h4>
                        <div>
                            <template v-if="!loadingSprints">
                                <!-- FAVORITE -->
                                <Transition>
                                    <div v-if="favoritesFilter?.length">
                                        <h4 class="m-0 font-size-14 font-weight-500 gray63 fav__h4" >{{$t('Chat.favorites')}}</h4>
                                        <template v-if="favoritesFilter?.length">
                                            <TransitionGroup>
                                                <ChatListItem
                                                    v-for="chat in sortedFavoriteChat"
                                                    :key="chat.id"
                                                    :item="chat"
                                                    :active="chat.id === selectedChat?.id"
                                                    @click="setActiveChat"
                                                    type="user"
                                                    @toggle="chat.isExpanded = !chat.isExpanded"
                                                >
                                                    <template #options>
                                                        <Transition>
                                                            <div v-if="myCounts?.[`task_${selectedProject._id}_${chat.sprintId}_${chat._id}_comments`]" class="white border-radius-1 font-size-12 bg-red p2x-5px">
                                                                {{myCounts?.[`task_${selectedProject._id}_${chat.sprintId}_${chat._id}_comments`] > 99 ? "+99" : myCounts?.[`task_${selectedProject._id}_${chat.sprintId}_${chat._id}_comments`]}}
                                                            </div>
                                                        </Transition>
                                                    </template>
                                                </ChatListItem>
                                            </TransitionGroup>
                                        </template>
                                        <template v-else>
                                            <div class="cursor-default text-center font-weight-normal m10px-0px">
                                                {{$t('Category.no_chat_found')}}
                                            </div>
                                        </template>
                                    </div>
                                </Transition>

                                <!-- CHATS -->
                                <template v-if="chatsFilter?.length">
                                    <TransitionGroup>
                                        <ChatListItem
                                            v-for="chat in sortedChat"
                                            :key="chat.id"
                                            :item="chat"
                                            :active="chat.id === selectedChat?.id"
                                            @click="setActiveChat"
                                            type="user"
                                        >
                                            <template #options>
                                                <div class="convertdate_formate-wrapper">
                                                    <div class="date_or_text">
                                                        {{chat?.lastMessage ? convertDateFormat(chat.lastMessage) : ""}}
                                                    </div>
                                                    <div>
                                                        <Transition>
                                                            <div v-if="myCounts?.[`task_${selectedProject._id}_${chat.sprintId}_${chat._id}_comments`]" class="red border-radius-1 font-size-12 bg-transparent border-red p2x-5px leftside_replay-count">
                                                                {{myCounts?.[`task_${selectedProject._id}_${chat.sprintId}_${chat._id}_comments`] > 99 ? "+99" : myCounts?.[`task_${selectedProject._id}_${chat.sprintId}_${chat._id}_comments`]}}
                                                            </div>
                                                        </Transition>
                                                    </div>
                                                </div>
                                            </template>
                                        </ChatListItem>
                                    </TransitionGroup>
                                </template>
                                <template v-else>
                                    <div class="cursor-default text-center font-weight-normal mt-10px">
                                        {{$t('Category.no_chat_found')}}
                                    </div>
                                </template>
                            </template>
                            <template v-else>
                                <Skelaton style="height: 40px;" class="border-radius-5-px mb-5px" v-for="i in Math.round(Math.random() * (8-2) + 2)" :key="i"/>
                            </template>

                            <!-- USERS -->
                            <Transition>
                                <div v-if="usersFilter?.length">
                                    <h4 class="m-0 mt-1">{{$t('UserTimesheet.users')}}</h4>
                                    <template v-if="usersFilter?.length">
                                        <TransitionGroup>
                                            <ChatListItem
                                                v-for="user in usersFilter"
                                                :key="user.id"
                                                :item="user"
                                                :active="user.id === selectedChat?.id"
                                                @click="setActiveChat"
                                                type="user"
                                            />
                                        </TransitionGroup>
                                    </template>
                                    <template v-else>
                                        <div class="cursor-default text-center font-weight-normal mt-10px">
                                            {{$t('Category.no_chat_found')}}
                                        </div>
                                    </template>
                                </div>
                            </Transition>
                        </div>
                    </template>
                    <div v-else>
                        <UpgradePlan
                            :buttonText="$t('Upgrades.upgrade_your_plan')"
                            :lastTitle="$t('Upgrades.unlock_one_chat')"
                            :secondTitle="$t('Upgrades.unlimited')"
                            :firstTitle="$t('Upgrades.upgrade_to')"
                            :message="$t('Upgrades.the_feature_not_available')"
                        />
                    </div>
                </template>
            </div>
        </div>
        <div class="chanel__detail-icon" :class="[{'border-right' : allowChannelFeature}]" v-else>
            <div class="overflow-y-auto style-scroll chanel__defultchat-wrapper">
                <Skelaton style="height: 40px;" class="border-radius-5-px mb-5px"/>
                <Skelaton style="height: 40px;" class="border-radius-5-px mb-5px"/>
                <Skelaton style="height: 40px;" class="border-radius-5-px mb-5px"/>
            </div>
        </div>
        <CreateCategorySidebar v-if="showCreateCategory" v-model:visible="showCreateCategory"/>
        <CreateChannelSidebar v-if="showCreateChannel"  v-model:visible="showCreateChannel" :folder="Object.values(selectedProject?.sprintsfolders || {})?.find((x) => x?.folderId === folderId)"/>
    </div>
</template>

<script setup>
// PACKAGES
import isEqual from "lodash/isEqual";
import { useRoute, useRouter } from "vue-router";
// import { useToast } from "vue-toast-notification";
import { computed, defineEmits, defineProps, inject, nextTick, onMounted, ref, watch, watchEffect } from "vue"

// COMPONENT
import InputText from "@/components/atom/InputText/InputText.vue"
import WasabiImageComp from "@/components/atom/WasabiIamgeCompp/WasabiIamgeCompp.vue"
import ChatListItem from "@/components/atom/ChatListItem/ChatListItem.vue"
import DropDown from '@/components/molecules/DropDown/DropDown.vue'
import DropDownOption from '@/components/molecules/DropDownOption/DropDownOption.vue'
import CreateChannelSidebar from '@/components/organisms/CreateChannelSidebar/CreateChannelSidebar.vue'
import CreateCategorySidebar from '@/components/organisms/CreateCategorySidebar/CreateCategorySidebar.vue'
import Skelaton from "@/components/atom/Skelaton/Skelaton.vue"
import { useConvertDate, useCustomComposable, useGetterFunctions } from "@/composable";
import { useStore } from "vuex";
import UpgradePlan from '@/components/atom/UpgradYourPlanComponent/UpgradYourPlanComponent.vue';

// UTILS
const clientWidth = inject("$clientWidth");
const companyId = inject("$companyId");
const userId = inject("$userId");
const selectedProject = inject("selectedProject");
const {getters, dispatch} = useStore();
const {debounce, checkPermission} = useCustomComposable();
const {getUser} = useGetterFunctions();
const {convertDateFormat} = useConvertDate()

const router = useRouter()
const route = useRoute()
// const $toast = useToast();

// IMAGES
const allChats = require("@/assets/images/svg/chat_1.svg");
const createCategory = require("@/assets/images/png/add_category.png");
const sidebarArrowIcon = require("@/assets/images/svg/sidebarclose_arrow.svg");
const addLogo = require("@/assets/images/svg/addIcon.svg");
// const triangleBlack = require("@/assets/images/svg/triangleBlack.svg");

// EMITS
const emit = defineEmits(["hide", "selectedChat"])

const props = defineProps({
    selectedChat: {
        type: Object,
        default: () => {}
    },
    projects: {
        type: Array,
        default: () => []
    },
    loadingChats: {
        type: Boolean,
        default: false
    }
})

const myCounts = computed(() => getters["users/myCounts"]?.data || {})
const currentCompanyImage = computed(() => getters['settings/companies'].find((x) => x._id === companyId.value)?.Cst_profileImage || null)
const currentCompanyName = computed(() => getters['settings/companies'].find((x) => x._id === companyId.value)?.Cst_CompanyName || null)

const companyUserDetail = computed(() => getters['settings/companyUserDetail'])
const chatsGetters = computed(() => JSON.parse(JSON.stringify(getters["mainChat/chats"]?.data)));

const usersGetter = computed(() => {
    return getters["users/users"].map((x) => ({
        name: x.Employee_Name,
        id: x._id,
        AssigneeUserId: [x._id],
        newUser: true,
        receiverId: x._id
    })).filter((x) => {
        return x.id !== userId.value &&  !chatsGetters.value.filter((y) => y.AssigneeUserId.filter((z) => x.AssigneeUserId.includes(z)).length).length
    })
});
const currentPlan = computed(() => getters['settings/selectedCompany']?.planFeature);
const allowChannelFeature = computed(() => currentPlan.value && currentPlan.value?.chanels);
const allowOneToOneChatFeature = computed(() => currentPlan.value && currentPlan.value?.oneToOneChat);

const folderId = ref(null);
const searchChat = ref("");
const showCreateChannel = ref(false);
const showCreateCategory = ref(false);
const usersFilter = ref([]);
const chats = ref([]);
const chatsFilter = ref([]);
const favorites = ref([]);
const favoritesFilter = ref([]);
const category = ref([]);

const loadingSprints = ref(false);
const sprintFolders = ref({});
const sprintData = ref([]);
const folderData = ref([]);

const users = ref(usersGetter.value || []);
watchEffect(() => {
    const val = usersGetter.value.filter((x) => !chatsFilter.value.length || chatsFilter.value.filter((y) => !y.AssigneeUserId.includes(x.id)).length)
    users.value = val;
})

const sortedChat = computed(() => {
    let chats = chatsFilter.value;
    let lastUpdate = chats.filter((x) => x?.lastMessage)?.sort((a, b) => new Date(a.lastMessage) > new Date(b.lastMessage) ? -1 : 1)
    let nameSorted = chats.filter((x) => !x?.lastMessage)?.sort((a, b) => a?.TaskName?.trim()?.toLowerCase() > b?.TaskName?.trim()?.toLowerCase() ? 1 : -1)

    return [...lastUpdate, ...nameSorted]
})
const sortedFavoriteChat = computed(() => {
    let chats = favoritesFilter.value;
    let lastUpdate = chats.filter((x) => x?.lastMessage)?.sort((a, b) => new Date(a.lastMessage) > new Date(b.lastMessage) ? -1 : 1)
    let nameSorted = chats.filter((x) => !x?.lastMessage)?.sort((a, b) => a?.TaskName?.trim()?.toLowerCase() > b?.TaskName?.trim()?.toLowerCase() ? 1 : -1)

    return [...lastUpdate, ...nameSorted]
})

function checkAllCount(project) {
    let total = 0;

    Object.keys(myCounts.value || {}).forEach((key) => {
        if(key.includes(`task_${project._id}`)) {
            total += myCounts.value[key];
        }
    })

    return total;
}

function separateFav() {
    let channelId = route.params.sid;

    let channel = null;
    let sprints = [];

    if(selectedProject.value?.default) {
        sprints = JSON.parse(JSON.stringify(chatsGetters.value))

        if(!sprints.length) {
            chats.value = [];
            favorites.value = [];
        }

        // MAP _id to id for created chats and selection
        sprints = sprints.map((x) => {
            x.id = x._id;
            return x;
        })
    } else {
        Object.values(selectedProject.value?.sprintsfolders || {}).forEach((folder) => {
            Object.values(folder?.sprintsObj || {}).forEach((sprint) => {
                if(companyUserDetail.value.roleType !== 1 && companyUserDetail.value.roleType !== 2 && sprint.private) {
                    if(sprint.AssigneeUserId.includes(userId.value)) {
                        sprints.push(sprint)
                    }
                } else {
                    sprints.push(sprint)
                }
            })
        })
        setCategories()
    }
    if(!channelId && !sprints.length) {
        emit('selectedChat', null);
        if(usersFilter.value.findIndex((x) => x.id === channelId) !== -1) {
            let userIndex = usersFilter.value.findIndex((x) => x.id === channelId)
            if(userIndex !== -1) {
                let sprint = Object.values(selectedProject.value?.sprintsObj)?.[0]
                emit('selectedChat', {...usersFilter.value[userIndex], sprintId: sprint?._id, newChat: true});
            }
        } else if(route.name === "chat_project_channel") {
            // $toast.error(`You don't have access to the requested chat`, {position: "top-right"});
            router.push({name: "chats", params: {cid: companyId.value}});
        }
        return; // NO SPRINTS
    }

    if(channelId) {
        channel = sprints.find((x) => (selectedProject.value?.default ? x._id : x.id) === channelId)
    }

    let foundChat = null;
    if(channel) {
        const receiverId = channel?.AssigneeUserId?.filter((x) => x !== userId.value)[0];
        emit('selectedChat', {...channel, receiverId});
        foundChat = {...channel, receiverId};
    } else if(usersFilter.value.findIndex((x) => x.id === channelId) !== -1) {
        let userIndex = usersFilter.value.findIndex((x) => x.id === channelId)
        if(userIndex !== -1) {
            let sprint = Object.values(selectedProject.value?.sprintsObj)?.[0]
            const obj = {...usersFilter.value[userIndex], sprintId: sprint?._id, newChat: true}
            emit('selectedChat', obj);
            foundChat = obj;
        }
    } else {
        if(!channelId || (sprints?.length && channelId && !foundChat)) {
            if(!channel && channelId) {
                // $toast.error(`You don't have access to the requested chat`, {position: "top-right"});
            }
            if(sprints.length) {
                let selectChat = {};
                if(selectedProject.value?.default) {
                    let lastMessaged = sprints?.filter((x) => x.lastMessage)
                    lastMessaged = lastMessaged.sort((a,b) => new Date(a.lastMessage) > new Date(b.lastMessage) ? -1 : 1);

                    if(lastMessaged?.length) {
                        selectChat = lastMessaged[0]
                    } else {
                        selectChat = sprints[0];
                    }
                } else {
                    selectChat = sprints[0];
                }
                setActiveChat(selectChat);
            } else {
                if(selectedProject.value?._id) {
                    router.push({name: "chat_project", params: {cid: companyId.value, pid: props?.selectedProject?._id || ""}});
                } else {
                    router.push({name: "chats", params: {cid: companyId.value}});
                }
            }
        }
    }

    if(selectedProject.value?.default) {
       setOntToOne(sprints)
    } else {
        setCategories();
    }
}

function setOntToOne(sprints) {
    usersFilter.value = users.value;

    sprints = sprints.map((x) => {
        let receiverId = x?.AssigneeUserId?.filter((x) => x !== userId.value)[0];
        x.TaskName = getUser(receiverId)?.Employee_Name;

        let ind = users.value.findIndex((y) => y.receiverId === receiverId);
        if(ind !== -1) {
            users.value.splice(ind, 1);
        }
        return x;
    })

    sprints = sprints?.sort((a, b) => a?.TaskName?.trim()?.toLowerCase() > b?.TaskName?.trim()?.toLowerCase() ? 1 : -1);

    sprints.filter((x) => x?.favouriteTasks?.filter((x) => x !== userId.value).length || true).forEach((sprint) => {
        let chatIndex = chats.value.findIndex((x) => x.id === sprint.id);

        if(chatIndex !== -1) {
            chats.value[chatIndex] = {...sprint}
        } else {
            chats.value.push(sprint)
        }
    })

    sprints.filter((x) => x?.favouriteTasks?.filter((x) => x === userId.value).length).forEach((sprint) => {
        let chatIndex = favorites.value.findIndex((x) => x.id === sprint.id);

        if(chatIndex !== -1) {
            favorites.value[chatIndex] = {...sprint}
        } else {
            favorites.value.push(sprint)
        }
    })
}

function setCategories() {
    const tmp = JSON.parse(JSON.stringify(selectedProject.value?.sprintsfolders || {}));
    let sprintsfolders = {};

    Object.values(tmp)?.forEach((x) => {
        const folder = {...x, sprintsObj: {}, isExpanded: category.value.find((y) => y.folderId === x.folderId)?.isExpanded || true}

        Object.values(x?.sprintsObj || {})?.forEach((sprint) => {
            if(companyUserDetail.value.roleType !== 1 && companyUserDetail.value.roleType !== 2 && sprint.private) {
                if(sprint.AssigneeUserId.includes(userId.value)) {
                    folder.sprintsObj[sprint.id] = {...sprint, folderId: folder.folderId};
                }
            } else {
                folder.sprintsObj[sprint.id] = sprint;
            }
        })
        sprintsfolders[folder.folderId] = folder;
    })
    category.value = Object.values(sprintsfolders);
}

onMounted(() => {
    sprintData.value = getters["mainChat/mainChatSprints"][selectedProject.value._id];
    folderData.value = getters["mainChat/mainChatFolders"][selectedProject.value._id];
    separateFav();
    if(selectedProject?.value?._id){
        getSprintFolderData(selectedProject.value._id); 
    }
    chatsInit();
})

function chatsInit() {
    if(selectedProject.value?.default && searchChat.value.length) {
        chatsFilter.value = chats.value.filter((x) => x.TaskName.toLowerCase().includes(searchChat.value.toLowerCase()))
        favoritesFilter.value = favorites.value.filter((x) => x.TaskName.toLowerCase().includes(searchChat.value.toLowerCase()))
        usersFilter.value = JSON.parse(JSON.stringify(users.value)).filter((x) => x.name.toLowerCase().includes(searchChat.value.toLowerCase()))
    } else {
        chatsFilter.value = chats.value;
        favoritesFilter.value = favorites.value;
        usersFilter.value = JSON.parse(JSON.stringify(users.value));
    }
}

watch(() => selectedProject.value, (newVal, oldVal) => {
    if(newVal._id !== oldVal._id) {
        searchChat.value = "";
        getSprintFolderData(newVal._id);
    }
})
watch(route, (newRoute) => {
    if(newRoute.params.sid) {
        getSprintFolderData(selectedProject.value._id);
    }
})
watch(chatsGetters, (newVal, oldVal) => {
    if(oldVal === undefined) {
        return;
    }
    if(!isEqual(newVal, oldVal)) {
        getSprintFolderData(selectedProject.value._id);
    }
},{deep:true,immediate:true})

watch(() => getters["mainChat/mainChatSprints"],(sprintfold) => {
    if(JSON.stringify(sprintData.value) !== JSON.stringify(sprintfold[selectedProject.value._id] || [])){
        sprintData.value = sprintfold[selectedProject.value._id];
        getSprintFolderData(selectedProject.value._id);
    }
})

watch(() => getters["mainChat/mainChatFolders"],(folder) => {
    if(JSON.stringify(folderData.value) !== JSON.stringify(folder[selectedProject.value._id] || [])){
        folderData.value = folder[selectedProject.value._id];
        getSprintFolderData(selectedProject.value._id);
    }
})

watch([searchChat, chats, favorites, category, users], debounce(() => {
    chatsInit();
}, 1000))

function setProject(data) {
    if(!data || data._id === selectedProject.value?._id) return;
    router.push({name: "chat_project", params: {cid: companyId.value, pid: data?._id}});
    emit('selectedChat', null);
}

function setActiveChat(data) {
    if(!data || data.id === props.selectedChat?.id) return;
    router.push({name: "chat_project_channel", params: {cid: companyId.value, pid: selectedProject.value._id, sid: data._id ? data._id : data.id}});
    emit('selectedChat', null);
}

// CHECK COUNT
function checkCount(folder) {
    let count = 0;

    let sprints = Object.values(folder?.sprintsObj || {})?.map((x) => x.id);

    if(Object.keys(myCounts.value || {}).length) {
        Object.keys(myCounts.value).forEach((countKey) => {
            if(sprints.filter((x) => countKey.includes(x)).length && countKey.includes("task_") && countKey.includes("_comments")) {
                count += myCounts.value?.[countKey]
            }
        })
    }

    return count;
}


function getSprintData(id) {
    return new Promise((resolve, reject) => {
        try {
            if(Object.keys(getters["mainChat/mainChatSprints"]).includes(id)){
                if(!sprintData.value || !Object.keys(sprintData.value || {}).length){
                    sprintData.value = getters["mainChat/mainChatSprints"][id];
                }
                resolve(sprintData.value,true);
                return;
            }

            let projectId = id;
            dispatch("mainChat/setChatSprints",{projectId}).then((sprintss) => {
                sprintData.value = sprintss;
                resolve(sprintss);
            })
        } catch (error) {
            reject(error);
        }
    })
}

function getFolderData(id) {
    return new Promise((resolve, reject) => {
        try {
            if(Object.keys(getters["mainChat/mainChatFolders"]).includes(id) || selectedProject.value.default){
                if(!folderData.value || folderData.value.length === 0 || !Object.keys(folderData.value || {}).length){
                    folderData.value = getters["mainChat/mainChatFolders"][id];
                }
                resolve(folderData.value,true);
                return;
            }
            let projectId = id;
            // ATTENTION PLEASE DO NOT REMOVE THIS COMMENTED CODE AS IT IS REQUIRED WHEN WE IMPLEMENT SOCKT IN IT
            // const uid = companyUserDetail.value.userId;
            // let publicQuery = {
            //     private:false,
            //     projectId : BSON.ObjectId(projectId)
            // }

            // let snapPublicQuery = {
            //     "fullDocument.projectId" : BSON.ObjectId(projectId)
            // }
            // let privateQuery = {
            //     projectId : BSON.ObjectId(projectId)
            // }

            // let snapPrivateQuery = {
            //     "fullDocument.projectId" : BSON.ObjectId(projectId)
            // }
            dispatch("mainChat/setChatFolders",{projectId}).then((folders) => {
                resolve(folders);
                folderData.value = folders;
            })
        } catch (error) {
            reject(error);
        }
    })
}

// const isLoading = ref(false);
const getSprintFolderData = async (id) => {
    try {
        loadingSprints.value = true;
        Promise.allSettled([getSprintData(id), getFolderData(id)])
        .then((results) => {
            const resolvedPromises = results.filter((result) => result.status === 'fulfilled');
            if (resolvedPromises.length === 2) {
                const [sprintsResult, foldersResult] = resolvedPromises.map((result) => result.value);
                const sprintsArray = sprintsResult?.filter(sprint => sprint.projectId === id && !sprint.folderId).map((x) => ({ ...x, id:x._id }));

                const foldersObject = foldersResult?.reduce((acc, folder) => {
                    if (folder.projectId === id) {
                        let folId = folder._id
                        acc[folId] = {
                            folderId: folId,
                            name: folder.name,
                            sprintsObj: {},
                            deletedStatusKey: folder.deletedStatusKey,
                            legacyId : folder?.legacyId ? folder?.legacyId : '',
                            id: folder._id,
                            _id: folder._id,
                        };
                    }
                    return acc;
                }, {});

                sprintsResult?.forEach(sprint => {
                    if (sprint.projectId === id && sprint.folderId && foldersObject[sprint.folderId]) {
                        sprint.folderName = foldersObject[sprint.folderId].name;
                        sprint.id = sprint?._id;
                        foldersObject[sprint.folderId].sprintsObj[sprint.id] = sprint;
                    }
                });
                sprintFolders.value = {
                    [id]: {
                        folders: foldersObject,
                        sprints: sprintsArray,
                    }
                };

                let project = selectedProject.value;
                let allSprints = sprintFolders.value !== undefined && sprintFolders.value && sprintFolders.value[selectedProject.value._id] ? sprintFolders.value[selectedProject.value._id]?.sprints : []
                allSprints = [...allSprints];

                let allFolders = sprintFolders.value && sprintFolders.value[selectedProject.value._id] ? sprintFolders.value[selectedProject.value._id]?.folders : {}

                const sprintIdToObject = {};
                allSprints.forEach(item => {sprintIdToObject[item.id] = item;});

                project.sprintsObj = sprintIdToObject;
                project.sprintsfolders = allFolders;
                // var newObj = {snap: null, privateSnap: false, userId: userId.value,roleType: companyUserDetail.value.roleType, op: "modified", data: {...project, isExpanded: true}};

                selectedProject.value.sprintsObj = project.sprintsObj;
                selectedProject.value.sprintsfolders = project.sprintsfolders;

                // commit("mainChat/mutateChatProjects",[newObj]);
                nextTick(() => {
                    loadingSprints.value = false;
                    separateFav();
                })
            } else {
                loadingSprints.value = false;
                console.error("One or more promises were rejected");
            }
        })
        .catch((error) => {
            loadingSprints.value = false;
            console.error("Error in Promise.allSettled", error);
        });
    } catch (error) {
        console.error("ERROR", error);
    }
}
</script>

<style lang="css">
.v-enter-active,
.v-leave-active {
  transition: all 0.2s ease;
}
.v-enter-from,
.v-leave-to {
  opacity: 0;
}
.chat__chanel-icons{
    width: 69px;
}
.chanel__detail-icon{
    width: calc(100% - 70px);
}
.h-35px{
    height: 35px;
}
.selected__projectid-div{
    width: 5px;
    left: 0px;
}
.all_chats-img{
    width: 20px; 
    height: 20px;
}
.checkall__count{
    top: -5px;
    right: -5px; 
    left: unset;
}
.chanel__searchinput-wrapper{
    height: 50px;
}
.chanel__searchinput{
   height: 30px !important;
}
.chanel__defultchat-wrapper{
    height: calc(100% - 61px); 
    padding: 5px;
    scrollbar-width: none;
}
.fav__h4{
    line-height: 23px;
}
.date_or_text {
    font-family: Roboto;
    font-size: 11px;
    font-weight: 500;
    line-height: 18px;
    letter-spacing: 0em;
    text-align: right;
    color: rgba(149, 149, 149, 1);
}
.leftside_replay-count {
    width: 18px;
    height: 18px;
    font-family: Roboto;
    font-size: 9px;
    font-weight: 500;
    text-align: center;
    line-height: 12px;
    letter-spacing: 0em;
    margin-left: auto;
}
.convertdate_formate-wrapper {
    width: 20%;
}
span.notification-tick.blinking.checkall__count {
    width: 18px;
    height: 18px;
    font-size: 9px;
    text-align: center;
    line-height: 18px;
    top: inherit;
    bottom: -5px;
    border-radius: 50%;
}
span.company_latter{
    display: block;
    height: 100%;
    width: 100%;
    text-align: center;
    line-height: 33px;
    border-radius: 3px;
}
</style>