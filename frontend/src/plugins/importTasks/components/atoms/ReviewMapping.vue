<template>
	<div class="p-20px pb-0px">
		<p class="mt-0px">{{ $t('reviewMaping.title') }}</p>
		<!-- Warning message displayed if there are any missing or invalid required fields -->
		<div class="border-red border-radius-5-px bg-lighter-red mb-20px d-flex" v-if="tableData.some(row => Object.values(row).some((col, colIndex) => {
			const header = staticHeaders[colIndex];
			return isRequiredColumn(header) && (col === 'N/A' || col === '');
		}))">
			<img :src=red_warning alt="warning icon" class="w-20 mr-10px ml-10px">
			<p class="red">
				{{ $t('reviewMaping.warning') }}
			</p>
		</div>
		<!-- Scrollable table displaying the user data -->
		<div class="scrollable style-scroll">
			<table class="text-center border-collapse w-100">
				<thead class="position-sti sticky-header">
					<tr>
						<th v-for="(header, index) in staticHeaders" :key="index"
							class="p-8px bg-colorlightgray font-weight-700 bordergray text-center">
							{{ header }}
						</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="(row, rowIndex) in tableData" :key="'row' + rowIndex">
						<td v-for="(col, colIndex) in row" :key="'col' + colIndex"
							:title="tableData[rowIndex][colIndex]" :class="{
								'required-field': isRequiredColumn(staticHeaders[colIndex]) && (col === 'N/A' || col === ''),
								'default-value': isDefaultValue(staticHeaders[colIndex], col, rowIndex, colIndex)
							}" class="p-5px bordergray">
							<input v-model="tableData[rowIndex][colIndex]" :class="{
								'required-field': isRequiredColumn(staticHeaders[colIndex]) && (col === 'N/A' || col === '')
							}" class=" p-5px
								border-0 text-center w-100" type="text" />
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</template>

<script setup>
import { defineProps, onMounted, ref, computed, defineExpose, defineEmits } from 'vue';
const red_warning = require("@/assets/images/svg/redWarning.svg");

const props = defineProps({
	userTable: {
		type: Array,
		required: true,
	},
});

const emit = defineEmits(['update-data']);
const staticHeaders = ref([]);
const headerKeys = ref([]);
const tableData = ref([]);

// Assign headers and data from props to reactive variables
onMounted(() => {
	try {
		if (!props.userTable || props.userTable.length < 2) {
			throw new Error('Invalid userTable data: Must contain at least headers and data rows.');
		}
		staticHeaders.value = Object.values(props.userTable[0]); // First row as headers
		headerKeys.value = Object.values(props.userTable[1]);  // Second row as keys for data
		tableData.value = props.userTable.slice(2); // Remaining rows as table data
	} catch (error) {
		console.error('Error during onMounted setup:', error);
	}
});

const requiredColumns = ["Task Name", "Task Leader ID"];

const isRequiredColumn = (header) => requiredColumns.includes(header);

const defaultValues = {
	"Task Priority": "MEDIUM",
	"Status": "To Do",
};

// Function to check empty values and set default values for columns
const isDefaultValue = (header, value, rowIndex, colIndex) => {
	try {
		if (header === "Task Priority" && (value === "N/A" || value === "null")) {
			tableData.value[rowIndex][colIndex] = defaultValues["Task Priority"]; // Set default value for Task Priority
			return true;
		}
		if (header === "Status" && (value === "N/A" || value === "null")) {
			tableData.value[rowIndex][colIndex] = defaultValues["Status"]; // Set default value for Status
			return true;
		}
		return false;
	} catch (error) {
		console.error(`Error while checking or setting default values for row ${rowIndex}, column ${colIndex}:`, error);
		return false;
	}
};

// Create a data with the keys as the header and the property as their respective value
const mappedData = computed(() => {
	try {
		if (!headerKeys.value.length || !tableData.value.length) return [];
		return tableData.value.map((row) => {
			const mappedRow = {};
			headerKeys.value.forEach((header, index) => {
				mappedRow[header] = row[index];
			});
			return mappedRow;
		});
	} catch (error) {
		console.error('Error computing mapped data:', error);
		return [];
	}
});

// Function to get final filtered data (after checking required columns)
const getFinalData = () => {
	return new Promise((resolve, reject) => {
		try {
			const reqFields = ['TaskName', 'Task_Leader'];
			if (!mappedData.value.length) {
				throw new Error('No mapped data available to filter.');
			}
			// Filter out rows where any required field is "N/A" or empty
			const filteredData = mappedData.value.filter((row) => {
				return !reqFields.some((column) => {
					const value = row[column];
					return value === "N/A" || value.trim() === "";
				});
			});

			if (filteredData.length === 0) {
				reject(new Error("No valid tasks found. Please ensure required fields are not empty."));
				return;
			}

			filteredData.forEach((row) => {
				// Set default values for Task Priority and Status if not provided
				if (row['Task_Priority'] === "") row['Task_Priority'] = defaultValues['Task Priority'];
				if (row['status'] === "") row['status'] = defaultValues['Status'];
			});
			emit('update-data', { filteredData });
			resolve(true);
		} catch (error) {
			console.error('Error filtering data in getFinalData:', error);
			reject(error);
		}
	});
};

defineExpose({
	getFinalData,
});
</script>


<style scoped>
.sticky-header {
	top: 0;
}

.scrollable {
	overflow-y: auto;
	max-height: 60vh;
	overflow-x: auto;
}

.required-field {
	background-color: #FFB3B3;
}

.default-value {
	background-color: rgb(27, 180, 231);
}
</style>
