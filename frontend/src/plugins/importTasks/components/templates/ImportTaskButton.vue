<template>
	<div>
		<div>
			<Modal v-model="showModal" :title="$t('importTaskButton.import_title')" :header="true" :footer="true"
				:styles="modalStyles" @close="closeModal" :headerClasses="'p-20px blue font-size-18'">
				<template #body>
					<component :is="steps[currentStep].component" v-bind="steps[currentStep].props"
						@update-data="handleStepDataUpdate" @next-step="handleNext"
						@update-selection-status="handleSelectionStatus" ref="childRef" />
				</template>
				<template #footer>
					<div class="d-flex justify-content-end p-10px">
						<button class="outline-secondary" @click="handleBack">
							{{ $t('importTaskButton.back_button') }}
						</button>
						<button :class="{
							'btn-primary ml-10px': !disableProceedButton,
							'btn-secondary ml-10px': disableProceedButton
						}" @click="handleNext" :disabled="disableProceedButton">
							{{ $t('importTaskButton.next_button') }}
						</button>
					</div>
				</template>
			</Modal>
		</div>
	</div>
</template>

<script setup>
import { ref, defineProps, computed, inject, watch, defineEmits } from 'vue';
import { useI18n } from "vue-i18n";
import Modal from '@/components/atom/Modal/Modal.vue';
import ImportCsv from '../atoms/ImportCsv.vue';
import SetHeaderRow from '../atoms/SetHeaderRow.vue';
import HeaderMapping from '../organisms/HeaderMapping.vue';
import ReviewMapping from '../atoms/ReviewMapping.vue';
import UserMapping from '../molecules/UserMapping.vue';
import StatusMapping from '../molecules/StatusMapping.vue';
import PriorityMapping from '../molecules/PriorityMapping.vue';
import CustomFieldMap from '../molecules/CustomFieldMap.vue';
import { useGetterFunctions } from "@/composable";
import taskClass from "@/utils/TaskOperations";
import { useStore } from "vuex";
import * as env from '@/config/env';
import { useCustomComposable } from "@/composable";
import { useToast } from 'vue-toast-notification';
import { showAlertModal } from '@/components/atom/AlertBox/helper';

const $toast = useToast();
const progress = inject("progress");
const showLoader = inject("showLoader");
const { makeUniqueId } = useCustomComposable();
const { getUser } = useGetterFunctions()
const { getters, commit } = useStore();
const userId = inject("$userId")
const projectRef = inject("selectedProject");
const { t } = useI18n();
const showModal = ref(false);
const currentStep = ref(0);
const stepData = ref({});
const childRef = ref();
const disableProceedButton = ref(false);

const emit = defineEmits(['toggle-import-modal']);

const props = defineProps({
	users: {
		type: Array,
		required: true,
	},
	projectId: {
		type: String,
		required: true,
	},
	taskStatus: {
		type: Array,
		required: true
	},
	sprint: {
		type: Object,
		required: true
	},
	showImportModal: {
		type: Boolean,
		required: true
	}
})

const modalStyles = {
	width: '100%',
	maxWidth: '1300px !important',
	backgroundColor: '#fff',
	borderRadius: '10px',
};

watch(() => props.showImportModal, (newValue) => {
	if (newValue) {
		showModal.value = true;
	}
});

// Steps in the multi-step process with their corresponding components and props
const steps = ref([
	{ title: 'Step 0: Upload & Edit', component: ImportCsv, props: {} },
	{ title: 'Step 1: Review Header', component: SetHeaderRow, props: { headers: stepData.value.headers, tableData: stepData.value.tableData } },
	{ title: 'Step 2: Header Mapping', component: HeaderMapping, props: { headers: stepData.value.headers, tableData: stepData.value.tableData, currentProjectId: props.projectId } },
	{ title: 'Step 3: Review Mapping', component: ReviewMapping, props: { userTable: stepData.value.userTable } },
	{ title: 'Step 4: User Mapping', component: UserMapping, props: { filteredData: stepData.value.filteredData, users: props.users } },
	{ title: 'Step 5: Status Mapping', component: StatusMapping, props: { assigneeMappedData: stepData.value.assigneeMappedData, taskStatus: props.taskStatus } },
	{ title: 'Step 6: Priority Mapping', component: PriorityMapping, props: { statusMappedData: stepData.value.statusMappedData } },
	{ title: 'step 7: Custom Field Mapping', component: CustomFieldMap, props: { priorityMappedData: stepData.value.priorityMappedData } },
]);

// Updates step data and dynamically updates props for the next steps
const handleStepDataUpdate = (data) => {
	try {
		stepData.value = { ...stepData.value, ...data };
		steps.value[1].props = { headers: stepData.value.headers, tableData: stepData.value.tableData };
		steps.value[2].props = { headers: stepData.value.headers, tableData: stepData.value.tableData, currentProjectId: props.projectId };
		steps.value[3].props = { userTable: stepData.value.userTable };
		steps.value[4].props = { filteredData: stepData.value.filteredData, users: props.users };
		steps.value[5].props = { assigneeMappedData: stepData.value.assigneeMappedData, taskStatus: props.taskStatus };
		steps.value[6].props = { statusMappedData: stepData.value.statusMappedData };
		steps.value[7].props = { priorityMappedData: stepData.value.priorityMappedData };
	} catch (error) {
		console.error("Error updating step data:", error);
	}
};

// Validates conditions and navigates to the next step
const nextStepChecks = () => {
	try {
		if (currentStep.value < steps.value.length - 1) {
			currentStep.value++;
		} else {
			showModal.value = false;
		}
	} catch (error) {
		console.error("Error proceeding to next step:", error);
	}
}

// Handles "Next" button click logic for different steps
const handleNext = async (val = false) => {
	try {
		if (val?.auto) {
			// Auto navigation
			nextStepChecks();
		} else {
			// Manual navigation logic per step
			if (currentStep.value === 0) {
				showAlertModal({
					title: t("alertBox.valid_csv_title"),
					message: t("alertBox.valid_csv_text"),
					type: 'error',
					showCancel: false,
					confirmButtonText: t("alertBox.ok"),
				})
				return;
			} else if (currentStep.value === 2) {
				const isValid = await childRef.value?.validateData();
				if (isValid) {
					nextStepChecks();
				}
			} else if (currentStep.value === 3) {
				try {
					await childRef.value?.getFinalData();
					nextStepChecks();
				} catch (error) {
					showAlertModal({
						title: "Error",
						message: t('alertBox.invalid_tasks_error'),
						type: 'error',
						showCancel: false,
						confirmButtonText: t("alertBox.ok"),
					});
				}
			} else if (currentStep.value === 4) {
				await childRef.value?.replaceAssignees();
				nextStepChecks();
			} else if (currentStep.value === 5) {
				await childRef.value?.replaceStatus();
				nextStepChecks();
			} else if (currentStep.value === 6) {
				await childRef.value?.replacePriority();
				const hasCustomFields = stepData.value?.priorityMappedData?.some(task => Object.keys(task).some(key => key.startsWith('custom_')));

				if (hasCustomFields) {
					nextStepChecks();
				} else {
					showLoader.value = true;
					showModal.value = false;
					createMultipleTasks(stepData.value?.priorityMappedData);
				}
			} else if (currentStep.value === 7) {
				childRef.value?.sendMappedData()
					.then(() => {
						showLoader.value = true;
						showModal.value = false;
						createMultipleTasks(stepData.value?.customFieldMapped)
					})
					.catch((error) => {
						console.error("Error in field mapping:", error);
					})
			} else {
				nextStepChecks();
			}
		}
	} catch (error) {
		console.error("Error during step execution:", error);
	}
};

// Handles "Go Back" button click logic
const handleBack = () => {
	try {
		if (currentStep.value > 0) {
			showAlertModal({
				title: t("alertBox.go_back_title"),
				message: t("alertBox.go_back_text"),
				type: "warning",
				cancelButtonText: t("alertBox.cancel"),
				confirmButtonText: t("alertBox.confirm"),
			}).then(() => {
				currentStep.value--;
				disableProceedButton.value = false;
			}).catch(() => {
				return
			})
		} else {
			closeModal();
		}
	} catch (error) {
		console.error("Error going back to the previous step:", error);
	}
};

const closeModal = () => {
	showAlertModal({
		title: t("alertBox.close_modal_title"),
		message: t("alertBox.close_modal_text"),
		type: 'warning',
		showCancel: true,
		cancelButtonText: t("alertBox.no"),
		confirmButtonText: t("alertBox.yes"),
	}).then(() => {
		showModal.value = false;
		resetStepData();
		emit('toggle-import-modal', false);
	}).catch(() => {
		return;
	})
};

// Resets step data and modal state
const resetStepData = () => {
	try {
		stepData.value = { headers: [], tableData: [] };
		currentStep.value = 0;
		disableProceedButton.value = false;
	} catch (error) {
		console.error("Error resetting step data:", error);
	}
};

// Handles changes in selection status for enabling/disabling the Proceed button
const handleSelectionStatus = (status) => {
	disableProceedButton.value = status;
};

const customFieldList = computed(() => (getters['settings/finalCustomFields']));
const customFieldsArray = computed(() => {
	return (customFieldList.value || [])
		.filter(field => field.projectId.includes(props.projectId))
		.map(field => field._id);
});

// Deep clone utility
const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

// Helper to normalize date to ISO format
const normalizeDate = (input) => {
	if (!input) return null;

	const parsedDate =
		typeof input === 'number'
			? new Date((input - 25569) * 86400 * 1000) // Excel serial number
			: new Date(input);

	return isNaN(parsedDate.getTime()) ? null : parsedDate.toISOString();
};

// Promise function that transforms the custom field data and descriptionBlock
const createCustomFieldObj = (data) => {
	return new Promise((resolve, reject) => {
		try {
			const clonedData = deepClone(data);

			const matchedCustomFieldKeys = Object.keys(clonedData[0]).filter(key =>
				customFieldsArray.value.includes(key)
			);

			const transformedData = clonedData.map(task => {
				// Normalize dates
				if (task.startDate) {
					task.startDate = normalizeDate(task.startDate);
				}
				if (task.DueDate) {
					task.DueDate = normalizeDate(task.DueDate);
				}

				// Transform descriptionBlock
				if (typeof task.descriptionBlock === 'string') {
					task.descriptionBlock = {
						time: Date.now(),
						blocks: [
							{
								id: makeUniqueId(10),
								type: "paragraph",
								data: {
									text: task.descriptionBlock
								}
							}
						],
						version: "2.30.7"
					};
				}

				// Custom field transformation
				const customField = {};
				matchedCustomFieldKeys.forEach(key => {
					customField[key] = {
						fieldValue: task[key],
						_id: key
					};
					delete task[key];
				});

				return {
					...task,
					customField
				};
			});

			resolve(transformedData);
		} catch (error) {
			reject(error);
		}
	});
};


// Function to create multiple tasks at a time on last step
async function createMultipleTasks(data) {
	try {
		createCustomFieldObj(data).then(async (transformedData) => {

			let filterNullData = transformedData?.map(task => {
				const updatedTask = Object.keys(task).reduce((acc, key) => {
					acc[key] = task[key] === "N/A" ? "" : task[key];
					return acc;
				}, {});

				return updatedTask;
			}) || [];

			let tasks = filterNullData.map(task => ({
				...task,
				AssigneeUserId: task.AssigneeUserId
					? [...new Set(task.AssigneeUserId.split(',').map(id => id.trim()))]
					: []
			}));

			const companyOwner = computed(() => {
				return getters["settings/companyOwnerDetail"];
			});
			const user = getUser(userId.value);

			const userData = {
				id: user.id,
				Employee_Name: user.Employee_Name,
				companyOwnerId: companyOwner.value.userId,
			};

			let project = projectRef.value;

			const projectData = {
				_id: props.projectId,
				CompanyId: project.CompanyId,
				lastTaskId: project.lastTaskId,
				ProjectName: project.ProjectName,
				ProjectCode: project.ProjectCode
			};

			let indexObj = {
				indexName: "groupByStatusIndex",
				searchKey: "statusKey",
				searchValue: "1"
			};

			const evId = `ev_${makeUniqueId(12)}`;

			const source = new EventSource(`${env.API_URI}/task-import/events/${evId}`); // PRODUCTION ENVIRONMNET

			source.onmessage = (event) => {
				const { data } = JSON.parse(event.data);
				progress.value = data.step;

				if (data.step === 100) {
					source.close();
				}
			};

			source.onerror = (error) => {
				console.error("error in creating multiple tasks: ", error);
				source.close();
			};

			await taskClass.createMultipleTasks({
				tasks,
				userData,
				projectData,
				indexObj,
				statusArray: props.taskStatus,
				sprint: props.sprint,
				eventId: evId
			})
				.then(() => {
					showLoader.value = false;
					emit('toggle-import-modal', false);

					const sprint = props.sprint;
					sprint.tasks = sprint.tasks + tasks.length;

					commit("projectData/mutateSprints", { op: 'modified', data: { ...sprint } });

					$toast.success(t('Toast.import_task_success'), { position: 'top-right' });
					resetStepData();
				})
				.catch((err) => {
					console.error("Error in creating multiple tasks: ", err);
				});

		}).catch(error => {
			console.error("Error transforming custom fields: ", error);
		});

	} catch (error) {
		console.error("ERROR in create task: ", error);
	}
}


</script>
