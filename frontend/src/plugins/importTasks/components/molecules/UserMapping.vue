<template>
    <div>
        <div class="text-center w-80 m0-auto">
            <h2 class="m-0">{{ $t('valueMapping.user_mapping_title') }}</h2>
            <p class="font-size-14">
                {{ $t('valueMapping.user_mapping_instruction') }}
            </p>
        </div>
        <!-- Mapping Section -->
        <div class="m0-auto d-flex flex-column align-items-center scrollable style-scroll">
            <div class="mt-20px w-auto">
                <!-- Loop through unique users and display the mapping options -->
                <div v-for="(user, index) in uniqueUsers" :key="index"
                    class="d-flex align-items-center mb-15px border-bottom-mobiledrop pb-10px">
                    <div class="min-width text-center">
                        {{ user }}
                    </div>
                    <div class="ml-10px mr-30px">→</div>
                    <!-- Dropdown for mapping users -->
                    <div class="min-width">
                        <DropDown z-index="9">
                            <template #button>
                                <button
                                    class="bg-white border-radius-5-px border-groupBy cursor-pointer font-size-14 dark-gray w-100"
                                    ref="expand_collapse">
                                    <div class="d-flex justify-content-between align-items-center m-5px">
                                        <p class="m-0 color94">
                                            {{ selectedUsers[index] || $t('valueMapping.user_dropdown_text') }}
                                        </p>
                                        <img :src=dropDownSvg alt="dropDownSvg" class="w-20">
                                    </div>
                                </button>
                            </template>
                            <template #options>
                                <DropDownOption>
                                    <input type="text" placeholder="Search" v-model="search[index]"
                                        class="p6px-8px border-gray-blue border-radius-4-px font-size-14" />
                                </DropDownOption>
                                <DropDownOption v-for="(user, userIndex) in filteredUsers(index)" :key="userIndex"
                                    :item="user"
                                    @click="replaceAssigneeId(index, user), $refs?.expand_collapse[index]?.click()">
                                    <span>{{ user }}</span>
                                </DropDownOption>
                            </template>
                        </DropDown>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>


<script setup>
import { computed, ref, defineExpose, defineEmits } from "vue";
import DropDown from "@/components/molecules/DropDown/DropDown.vue";
import DropDownOption from "@/components/molecules/DropDownOption/DropDownOption.vue";
import { useGetterFunctions } from "@/composable";
import { useI18n } from "vue-i18n";
import { showAlertModal } from "@/components/atom/AlertBox/helper";
const { t } = useI18n();
const dropDownSvg = require("@/assets/images/svg/dropdown_strong.svg");


const { getUser } = useGetterFunctions();


const search = ref([]);
const assigneeMappings = ref([]);
const selectedUsers = ref([]);
const emit = defineEmits(['update-data']);

const props = defineProps({
    filteredData: {
        type: Array,
        required: true,
    },
    users: {
        type: Array,
        required: true,
    },
});

// Compute the unique users from the filtered data
const uniqueUsers = computed(() => {
    const allIds = props.filteredData.flatMap((item) => {
        // Get Unique Assignees
        const assigneeIds = item.AssigneeUserId
            ? item.AssigneeUserId.split(",").map((id) => id.trim()).filter((id) => id !== "N/A")
            : [];

        // Get Unique Task Leaders 
        const taskLeaderIds = item.Task_Leader
            ? [item.Task_Leader.trim()].filter((id) => id !== "N/A")
            : [];

        // Combine leaders and assignees 
        return [...assigneeIds, ...taskLeaderIds];
    });

    // Return unique values
    return [...new Set(allIds)];
});


// Map user IDs to their corresponding names
const userNames = computed(() => {
    return props.users.filter((id) => id && id.trim() !== "")
        .map((id) => {
            const user = getUser(id);
            return user ? { id, name: user.Employee_Name } : { id, name: "Unknown User" };
        })
})

// Function to filter users based on the search term
const filteredUsers = (index) => {
    try {
        const term = search.value[index] || "";
        const userArray = Object.values(userNames.value.map(user => user.name))
        return userArray.filter((user) =>
            user.toLowerCase().includes(term.toLowerCase())
        );
    } catch (error) {
        console.error("Error filtering assignees:", error);
        return [];
    }
};

// Function to replace the assignee ID in the mappings based on what user selected
const replaceAssigneeId = (index, selectedUserName) => {
    try {
        const currentUser = uniqueUsers.value[index];
        const selectedUser = userNames.value.find((user) => user.name === selectedUserName);

        // Find existing mapping or create a new one
        const mappingIndex = assigneeMappings?.value.findIndex(
            (mapping) => mapping.oldAssigneeId === currentUser
        )
        if (mappingIndex !== -1) {
            assigneeMappings.value[mappingIndex].newAssigneeId = selectedUser.id;
        } else {
            assigneeMappings.value.push({
                oldAssigneeId: currentUser,
                newAssigneeId: selectedUser.id,
            });
        }
        selectedUsers.value[index] = selectedUser.name;
    } catch (error) {
        console.error("Error replacing AssigneeUserId:", error);
    }
};

// Function to replace assignees in the filtered data based on the mappings
const replaceAssignees = () => {
    return new Promise((resolve, reject) => {
        try {
            const unmappedUsers = uniqueUsers.value.filter(
                (userId) => !assigneeMappings.value.some(mapping => mapping.oldAssigneeId === userId)
            );

            // If there are unmapped users, show an error alert
            if (unmappedUsers.length > 0) {
                showAlertModal({
                    title: t("alertBox.incomplete_mapping_title"),
                    message: t("alertBox.incomplete_mapping_text"),
                    type: "error",
                    showCancel: false,
                    confirmButtonText: t("alertBox.ok"),
                })
                reject(false);
                return;
            }

            // Update assignees in filtered data using the mappings
            const assigneeMappedData = props.filteredData.map((task) => {
                const updatedTask = { ...task };

                // Update AssigneeUserId
                if (updatedTask.AssigneeUserId) {
                    updatedTask.AssigneeUserId = updatedTask.AssigneeUserId.split(",")
                        .map((assignee) => {
                            const mapping = assigneeMappings.value.find(
                                (map) => map.oldAssigneeId === assignee
                            );
                            return mapping ? mapping.newAssigneeId : assignee;
                        })
                        .join(",");
                }

                // Update Task_Leader
                if (updatedTask.Task_Leader) {
                    const mapping = assigneeMappings.value.find(
                        (map) => map.oldAssigneeId === updatedTask.Task_Leader
                    );
                    if (mapping) {
                        updatedTask.Task_Leader = mapping.newAssigneeId;
                    }
                }
                return updatedTask;
            });
            emit('update-data', { assigneeMappedData });
            resolve(true);
        } catch (error) {
            reject(false);
            console.error('Error replacing assignees:', error);
        }
    })
}

defineExpose({
    replaceAssignees
})
</script>

<style scoped>
.min-width {
    min-width: 250px;
}

.scrollable {
    overflow-y: auto;
    max-height: 60vh;
    overflow-x: auto;
}
</style>