<template>
  <div class="position-re h-100vh" v-if="checkPermission('project') !== null && checkPermission('project.project_list') !== null && checkPermission('task.task_list') !== null">
    <SpinnerComp :is-spinner="!loading" />
    <div v-if="loading">
      <div class="advancefilter">
        <div
          class="advancefilter__header d-flex align-items-center justify-content-between"
        >
          <div class="advancefilter__header--left d-flex align-items-center">
            <div
              class="pipeline_wrapper advancefilter__header--left--home"
              v-if="clientWidth > 768"
              @click="$emit('closeModel', true)"
            >
              <router-link :to="{name: 'Home', params: {cid: companyId}}">
                <img
                  class="cursor-pointer"
                  src="@/assets/images/home_icon.png"
                  alt="home_icon"
                />
              </router-link>
            </div>
            <span class="devider-line"></span>
            <div
              class="advancefilter__header--left--input"
              v-if="activeTab !== 'files' && activeTab !== 'links'"
            >
              <InputText
                v-model.trim="searchText"
                :placeHolder="$t('PlaceHolder.search')"
                :isDirectFocus="true"
                class="input-search"
              />
            </div>
          </div>
          <div
            class="advancefilter__header--right cursor-pointer"
            @click="$emit('closeModel', true)"
          >
            <img src="@/assets/images/cancel_icon.png" class="cancel__icon" alt="close" />
          </div>
        </div>

        <div class="advancefilter__body" :class="[{ 'd-flex': clientWidth > 1199 }]">
          <div
            class="advancefilter__body--left style-scroll"
            :class="[{ 'd-flex': clientWidth <= 1199 }]"
          >
            <div
              @click="activeTab === 'tasks' ? '' : taskTab()"
              class="d-flex align-items-center advancefilter__body--marginbottom cursor-pointer"
              :class="[{ 'advancefilter__body--active': activeTab === 'tasks' }]"
            >
              <span class="d-block w-16px">
                <img
                  v-if="activeTab === 'tasks'"
                  :src="taskImageBlue"
                  alt="taskImageBlue"
                />
                <img v-else :src="taskImage" alt="taskImage" />
              </span>
              <span
                class="advancefilter__body--name GunPowder advancefilter__body--left--image"
                >{{$t('Projects.tasks')}}</span
              >
            </div>
            <div
              @click="activeTab === 'project' ? '' : projectTab()"
              class="d-flex align-items-center advancefilter__body--marginbottom cursor-pointer"
              :class="[{ 'advancefilter__body--active': activeTab === 'project' }]"
            >
              <span class="d-block w-16px">
                <img
                  v-if="activeTab === 'project'"
                  :src="projectImageBlue"
                  alt="commentImageBlue"
                />
                <img v-else :src="projectImage" alt="commentImage" />
              </span>
              <span
                class="advancefilter__body--name GunPowder advancefilter__body--left--image"
                >{{$t('Filters.projects')}}</span
              >
            </div>
            <div
              @click="activeTab === 'files' ? '' : filetab()"
              class="d-flex align-items-center advancefilter__body--marginbottom cursor-pointer"
              :class="[{ 'advancefilter__body--active': activeTab === 'files' }]"
            >
              <span class="d-block w-16px">
                <img
                  v-if="activeTab === 'files'"
                  :src="fileImageBlue"
                  alt="fileImageBlue"
                />
                <img v-else :src="fileImage" alt="fileImage" />
              </span>
              <span
                class="advancefilter__body--name GunPowder advancefilter__body--left--image"
                >{{$t('Projects.files')}}</span
              >
            </div>
            <div
              @click="activeTab === 'links' ? '' : linkTab()"
              class="d-flex align-items-center advancefilter__body--marginbottom cursor-pointer"
              :class="[{ 'advancefilter__body--active': activeTab === 'links' }]"
            >
              <span class="d-block w-16px">
                <img v-if="activeTab === 'links'" :src="FileslinksBlue" alt="fileLinks" />
                <img v-else :src="fileLinks" alt="FileslinksBlue" />
              </span>
              <span
                class="advancefilter__body--name GunPowder advancefilter__body--left--image"
                >{{$t('Projects.links')}}</span
              >
            </div>
            <div
              @click="activeTab === 'comments' ? '' : commentTab()"
              class="d-flex align-items-center advancefilter__body--marginbottom cursor-pointer"
              :class="[{ 'advancefilter__body--active': activeTab === 'comments' }]"
            >
              <span class="d-block w-16px">
                <img
                  v-if="activeTab === 'comments'"
                  :src="commentImageBlue"
                  alt="commentImageBlue"
                />
                <img v-else :src="commentImage" alt="commentImage" />
              </span>
              <span
                class="advancefilter__body--name GunPowder advancefilter__body--left--image"
                >{{$t('Header.Comments')}}</span
              >
            </div>
          </div>
          <div class="d-flex advancefilter__body--centerwrapper">
            <div
              class="advancefilter__body--center position-re"
              :class="[{ 'advancefilter__body--center--reponsive': clientWidth <= 991 }]"
              :style="[{ 'max-width': '76.7%' }]"
            >
              <div class="advancefilter__body--sort d-flex justify-content-between">
                <div v-if="clientWidth > 991">
                  <span
                    v-if="activeTab !== 'files' && activeTab !== 'links'"
                    class="gray81"
                    >{{ searchResultSecond ? `${$t('Projects.results_in_time')} ${searchResultSecond} ${$t('Projects.seconds')}` : ''}}</span
                  >
                </div>
                <div
                  class="d-flex align-items-center advancefilter__body--centerfilter cursor-pointer"
                  @click="toggleSidebar"
                  v-if="clientWidth <= 991"
                >
                  <span><img :src="filterImage" alt="filterImage" /></span>
                  <span class="font-size-14 font-weight-400 GunPowder pl-15px"
                    >{{$t('Filters.filter')}}</span
                  >
                </div>
                <div
                  class="d-flex"
                  :class="[{ 'align-items-center': clientWidth < 767 }]"
                >
                  <span
                    class="advancefilter__body--sortby advancefilter__body--dropdown gray81"
                    >{{$t('Projects.sort_by')}}:</span
                  >
                  <DropDown :zIndex="9" :title="$t('Projects.sort_by')">
                    <template #button>
                      <div class="cursor-pointer" ref="adv_sortby">
                        <span class="advancefilter__body--taskname gray81">{{
                          $t(`Projects.${dropDownOptionValue}`)
                        }}</span>
                      </div>
                    </template>

                    <template #options>
                      <DropDownOption
                        @click="$refs.adv_sortby.click(), (dropDownOptionValue = 'last_update'), dropDownFilter()"
                      >
                      {{$t('Projects.last_update')}}
                      </DropDownOption>
                      <DropDownOption
                        @click="$refs.adv_sortby.click(), (dropDownOptionValue = 'last_created'), dropDownFilter()"
                      >
                      {{$t('Projects.last_created')}}
                      </DropDownOption>
                    </template>
                  </DropDown>
                </div>
              </div>
              <SpinnerComp :is-spinner="isLoading" />
              <Transition name="fade" mode="out-in" v-if="!isLoading">
                <div
                  v-if="searchResults.length > 0"
                  class="style-scroll advancefilter__body--scroll"
                  @scroll="onScroll"
                >
                  <TransitionGroup>
                    <div
                      v-for="(obj, index) in Array.from(new Set(searchResults))"
                      :key="index"
                    >
                      <!-- task filter component  -->
                      <TaskFilter
                        v-if="activeTab === 'tasks'"
                        :taskObj="obj"
                        :activeTab="activeTab"
                        :allProjectsArray="allProjectsArray"
                        :allTaskStatusArray="allTaskStatusArray"
                        :searchText="searchText"
                      />
                      <!-- file filter component  -->
                      <FileFilter
                        v-if="activeTab === 'files'"
                        :taskObj="obj"
                        :activeTab="activeTab"
                        :allProjectsArray="allProjectsArray"
                        :index="index"
                        :searchResults="searchResults"
                        :searchResultsLength="searchResults.length"
                        :searchText="searchText"
                      />
                      <!-- link filter component  -->
                      <LinkFilter
                        v-if="activeTab === 'links'"
                        :taskObj="obj"
                        :activeTab="activeTab"
                        :allProjectsArray="allProjectsArray"
                        :index="index"
                        :searchResults="searchResults"
                        :searchResultsLength="searchResults.length"
                      />
                      <!-- project filter component -->
                      <ProjectFilter
                        v-if="activeTab === 'project'"
                        :projectObj="obj"
                        :activeTab="activeTab"
                        :allProjectsArray="allProjectsArray"
                        :searchText="searchText"
                      />
                      <!-- comment filter component  -->
                      <CommentFilter
                        v-if="activeTab === 'comments'"
                        :commentObj="obj"
                        :activeTab="activeTab"
                        :allProjectsArray="allProjectsArray"
                        :searchText="searchText"
                      />
                    </div>
                  </TransitionGroup>
                </div>
                <div v-else>
                  <div v-if="activeTab === 'all'" class="nodata">{{$t('Filters.no_data_found')}}</div>
                  <div v-if="activeTab === 'tasks'" class="nodata">{{$t('Home.no_task_found')}}</div>
                  <div v-if="activeTab === 'files'" class="nodata">{{$t('Filters.no_file_found')}}</div>
                  <div v-if="activeTab === 'links'" class="nodata">{{$t('Filters.no_link_found')}}</div>
                  <div v-if="activeTab === 'comments'" class="nodata">
                    {{$t('Filters.no_comment_found')}}
                  </div>
                  <div v-if="activeTab === 'project'" class="nodata">
                    {{$t('Filters.no_project_found')}}
                  </div>
                </div>
              </Transition>
            </div>
            <div
              class="advancefilter__body--right"
              v-if="clientWidth > 991 || filterSidebar === true"
              :class="[
                {
                  'advancefilter__body--right--reponsive':
                    clientWidth <= 991 && filterSidebar === true,
                },
              ]"
            >
              <div class="table-data">
                <div class="table-data-padding_bottom">
                  <div class="d-flex justify-content-between">
                    <span class="advancefilter__body--filtename">{{
                      isEdit === true ? selectedRow.name : "Filters"
                    }}</span>
                    <span
                      v-if="clientWidth <= 991"
                      class="advancefilter__header--right cursor-pointer"
                    >
                      <img
                        src="@/assets/images/cancel_icon.png"
                        class="cancel__icon"
                        alt="close"
                        @click="filterSidebar = false"
                      />
                    </span>
                  </div>
                  <div
                    v-if="!isValidate"
                    role="alert"
                    aria-live="polite"
                    aria-atomic="true"
                    class="alert alert-danger font-size-13"
                  >
                    {{$t('Filters.pleaseselectvalid')}}
                  </div>
                </div>
                <div class="wrapper_table_data_padding_fields">
                  <FieldsTableAdvance
                    :inputs="inputs"
                    :statusArray="statusArray"
                    :allProjectsFilter="allProjectsFilter"
                    :priorities="prioritiesArray"
                    :users="usersDetail"
                    :milestoneType="milestoneType"
                    :allCurrency="allCurrency"
                    :allProjectStatus="allProjectStatus"
                    :mainOptions="keysArray"
                    :projectType="projectType"
                    :commentType="commentType"
                    @delete="deleteRow"
                    :zindexCustomDrop="10"
                    :responsiveDesign="true"
                    @apply="applyFilter"
                    :loading="isLoading"
                  />
                </div>
                <div class="add-section-table" v-if="keysArray.length">
                  <!-- <span><a href="#" style="margin-right: 10px;" @click.stop.prevent="clearFilter($event)">Clear all</a></span> -->
                  <a
                    href="#"
                    class="blue font-size-16 font-weight-500"
                    @click.stop.prevent="addRow"
                    :class="[{ 'font-size-18': clientWidth <= 768 }]"
                    >+ {{$t('Filters.addfilter')}}</a
                  >
                </div>
                <FieldsActionsAdvance
                  :filters="filters"
                  :isInvalid="isInvalid"
                  :isEdit="isEdit"
                  @save="saveFilter"
                  @update="updateFilter"
                  @delete="deleteFilter"
                  @apply="applyFilter"
                  @clear="clearFilter($event)"
                  :getFiltersData="getFiltersData"
                  :handleUpdate="handleUpdate"
                  :zIndex="11"
                />
                <ConfirmModal
                  :modelValue="isConfirm"
                  :acceptButtonText="$t('Home.Confirm')"
                    :cancelButtonText="$t('Projects.cancel')"
                  :header="true"
                  :showCloseIcon="false"
                  @accept="handleConfirm"
                  @close="isConfirm = false"
                  :styles="'z-index:12'"
                >
                  <template #header>
                    <h3 class="m-0">{{$t('Filters.confirm')}}</h3>
                  </template>
                  <template #body>
                    <span>{{$t('Filters.are_you_sure')}}?</span>
                  </template>
                </ConfirmModal>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="position-re h-100vh d-flex justify-content-center align-items-center">
    <img :src="accessDeniedImage" alt="accessDenied">
  </div>
</template>

<script setup>
// Packages, vue and database import
import moment from "moment";
import { useStore } from "vuex";
import { useCustomComposable, useGetterFunctions } from "@/composable";
import { defineEmits, ref, onMounted, inject, watch, computed, nextTick } from "vue";
import { apiRequest } from '../../../services';
import * as env from '@/config/env';
// css import
import "@/components/molecules/AdvanceSearch/style.css";
// Components
import { useToast } from "vue-toast-notification";
import ConfirmModal from "@/components/atom/Modal/Modal.vue";
import InputText from "@/components/atom/InputText/InputText.vue";
import DropDown from "@/components/molecules/DropDown/DropDown.vue";
import SpinnerComp from "@/components/atom/SpinnerComp/SpinnerComp.vue";
import FileFilter from "@/components/atom/AdvanceFilterFiles/AdvanceFilterFiles.vue";
import TaskFilter from "@/components/atom/AdvanceFilterTasks/AdvanceFilterTasks.vue";
import DropDownOption from "@/components/molecules/DropDownOption/DropDownOption.vue";
import ProjectFilter from "@/components/atom/AdvanceFilterProject/AdvanceFilterProject.vue";
import CommentFilter from "@/components/atom/AdvanceFilterComments/AdvanceFilterComments.vue";
import FieldsTableAdvance from "@/components/molecules/TaskFilterAdvance/FieldsTableAdvance.vue";
import FieldsActionsAdvance from "@/components/molecules/TaskFilterAdvance/FieldsActionAdvance.vue";
import LinkFilter from "@/components/atom/AdvanceFilterLinks/AdvanceFilterLinks.vue";
import { useI18n } from "vue-i18n";
const { t } = useI18n();

//helper
const $toast = useToast();
const { getters, dispatch } = useStore();
const { checkPermission } = useCustomComposable();

// Emits
const emit = defineEmits(["closeModel", "apply", "clear"]);

// Image
const commentImage = require("@/assets/images/svg/comment_image_svg.svg");
const commentImageBlue = require("@/assets/images/svg/comment_image_blue_svg.svg");
const taskImage = require("@/assets/images/svg/task_image_svg.svg");
const taskImageBlue = require("@/assets/images/svg/task_image_blue_svg.svg");
const projectImage = require("@/assets/images/svg/projectTab.svg");
const projectImageBlue = require("@/assets/images/svg/projectTabBlue.svg");
const filterImage = require("@/assets/images/svg/filterImage.svg");
const FileslinksBlue = require("@/assets/images/svg/FileslinksBlue.svg");
const fileLinks = require("@/assets/images/svg/Fileslinks.svg");
const fileImageBlue = require("@/assets/images/svg/file_image_blue_svg.svg");
const fileImage = require("@/assets/images/svg/file_image_svg.svg");
const accessDeniedImage = require("@/assets/images/access_denied_img.png");

// Computed
const users = computed(() => getters["users/users"]);
const priorities = computed(() => getters["settings/companyPriority"]);
const TaskStatusArray = computed(() => getters["settings/AllTaskStatus"]);
const projectStatusArray = computed(() => getters["settings/AllProjectStatus"]);
const companyUserDetail = computed(() => getters["settings/companyUserDetail"]);
const projectsGetter = computed(() => getters["projectData/onlyActiveProjects"]);
const defaultUserAvatar = inject("$defaultUserAvatar")

const keysArray = computed(() => {
  return mainOptions.value.filter((option) => {
    if (!inputs.value.some((input) => input.name.value === option.value)) {
      return option;
    }
  });
});
const usersDetail = computed(() => {
  return usersDetailArray.value?.map((x) => {
    return {
      finalValue: x._id,
      value: x._id,
      name: x.Employee_Name,
      image: x?.Employee_profileImageURL || defaultUserAvatar,
      isOnline: x.isOnline,
    };
  });
});
const statusArray = computed(() => {
  if (allTaskStatusArray.value.settings && allTaskStatusArray.value.settings.length) {
    return allTaskStatusArray.value?.settings.map((x) => {
      return { ...x, finalValue: x.key };
    });
  } else {
    return [];
  }
});
const allProjectsFilter = computed(() => {
  if (allProjectsArrayFilter.value && allProjectsArrayFilter.value.length) {
    return allProjectsArrayFilter.value.map((x) => {
      return { ...x, finalValue: x._id, value: x._id, name: x.ProjectName };
    });
  } else {
    return [];
  }
});
const prioritiesArray = computed(() => {
  return priorities?.value.map((x) => {
    return { ...x, finalValue: x.value };
  });
});
const projectType = computed(() => {
  return projectTypeArray.value;
});
const milestoneType = computed(() => {
  return milestoneTypeArray.value.map((x) => {
    return { finalValue: x.name, value: x.name, name: x.name };
  });
});
const allCurrency = computed(() => {
  return allCurrencyArray.value.map((x) => {
    return { finalValue: x.code, value: x.code, name: x.name };
  });
});
const allProjectStatus = computed(() => {
  if (
    allProjectStatusArray.value?.settings &&
    allProjectStatusArray.value.settings.length
  ) {
    return allProjectStatusArray.value?.settings.map((x) => {
      return {
        finalValue: x.value,
        value: x.value,
        backgroundColor: x.backgroundColor,
        textColor: x.textColor,
        name: x.name,
      };
    });
  } else {
    return [];
  }
});

const commentType = computed(() => {
  return commentTypeArray.value;
});
// inject
const userIdValue = inject("$userId");
const companyId = inject("$companyId");
// const urlRegex = inject("$urlRegex");
const clientWidth = inject("$clientWidth");

// Variables
const skip = ref(0);
const inputs = ref([]);
const filters = ref([]);
const timer = ref(null);
const isEdit = ref(false);
const loading = ref(true);
const batchSize = ref(20);
const searchText = ref("");
const filterQuery = ref({});
const selectedRow = ref({});
const isLoading = ref(false);
const isValidate = ref(true);
const isInvalid = ref(false);
const isConfirm = ref(false);
const isApplyed = ref(false);
const searchResults = ref([]);
const ProjectIdArray = ref([]);
const activeTab = ref("tasks");
const filterSidebar = ref(false);
const searchResultTotal = ref("");
const searchResultSecond = ref("");
const dropDownOptionValue = ref("last_update");
const usersDetailArray = ref(JSON.parse(JSON.stringify(users.value)));
const allProjectsArray = ref(JSON.parse(JSON.stringify(projectsGetter.value)));
const allTaskStatusArray = ref(JSON.parse(JSON.stringify(TaskStatusArray.value)));
const allProjectsArrayFilter = ref(JSON.parse(JSON.stringify(projectsGetter.value)));
const allProjectStatusArray = ref(JSON.parse(JSON.stringify(projectStatusArray.value)));
const allCurrencyArray = computed(() =>
  JSON.parse(JSON.stringify(getters["settings/allCurrencyArray"]))
);

const milestoneTypeArray = ref([{ name: "Hourly" }, { name: "Fix" }]);
const mainOptions = ref([
  { value: "DueDate", name: "due_date", type: "date", filterOn: "DueDate" },
  { value: "statusKey", name: "status", type: "array", filterOn: "statusKey" },
  { value: "ProjectID", name: "Project", type: "array", filterOn: "ProjectID" },
  {
    value: "AssigneeUserId",
    name: "Assigned_to",
    type: "array",
    filterOn: "AssigneeUserId",
  },
  { value: "Task_Leader", name: "created_by", type: "array", filterOn: "Task_Leader" },
  { value: "Task_Priority", name: "priority", type: "array", filterOn: "Task_Priority" },
  // { value: 'TaskTypeKey', name: "Task Type" },
  // { value: 'tagsArray', name: "Tags" }
]);
const projectTypeArray = ref([
  {
    name: "Private",
    value: true,
    finalValue: true,
  },
  {
    name: "Public",
    value: false,
    finalValue: false,
  },
]);
const commentTypeArray = ref([
  {
    name: "text",
    value: "text",
    finalValue: "text",
  },
  {
    name: "image",
    value: "image",
    finalValue: "image",
  },
  {
    name: "link",
    value: "link",
    finalValue: "link",
  },
  {
    name: "audio",
    value: "audio",
    finalValue: "audio",
  },
  {
    name: "video",
    value: "video",
    finalValue: "video",
  },
]);

// Watchers
watch(searchText, (newValue, oldVlue) => {
  if (newValue !== oldVlue) {
    debouncer(1000).then(async () => {
      skip.value = 0;
      batchSize.value = 20;
      searchResults.value = [];
      searchResultTotal.value = "";
      searchResultSecond.value = "";
      if (activeTab.value === "comments") {
        await searchComments();
      } else if (activeTab.value === "tasks") {
        await searchTasks();
      } else if (activeTab.value === "project") {
        await searchProject();
      } else if (activeTab.value === "links") {
        await searchLink();
      } else if (activeTab.value === "files") {
        await searchFiles();
      }
    });
  }
});
watch(
  () => activeTab.value,
  (newValue, oldvalue) => {
    searchResults.value = [];
    if (newValue !== oldvalue) {
      if (activeTab.value === "project") {
        mainOptions.value = [
          {
            value: "AssigneeUserId",
            name: "Assigned_to",
            type: "array",
            filterOn: "AssigneeUserId",
          },
          { value: "DueDate", name: "due_date", type: "date", filterOn: "DueDate" },
          {
            value: "ProjectType",
            name: "Project_Type",
            type: "string",
            filterOn: "isPrivateSpace",
          },
          {
            value: "MilestoneType",
            name: "Milestone_Type",
            type: "string",
            filterOn: "ProjectType",
          },
          {
            value: "ProjectCurrency",
            name: "Currency",
            type: "object",
            filterOn: "code",
          },
          {
            value: "status",
            name: "Project_Status",
            type: "array",
            filterOn: "status",
          },
        ];
      } else if (activeTab.value === "tasks") {
        mainOptions.value = [
          { value: "statusKey", name: "status", type: "array", filterOn: "statusKey" },
          { value: "DueDate", name: "due_date", type: "date", filterOn: "DueDate" },
          {
            value: "Task_Priority",
            name: "priority",
            type: "array",
            filterOn: "Task_Priority",
          },
          {
            value: "Task_Leader",
            name: "created_by",
            type: "array",
            filterOn: "Task_Leader",
          },
          {
            value: "AssigneeUserId",
            name: "Assigned_to",
            type: "array",
            filterOn: "AssigneeUserId",
          },
          { value: "ProjectID", name: "Project", type: "array", filterOn: "ProjectID" },
          // { value: 'TaskTypeKey', name: "Task Type" },
          // { value: 'tagsArray', name: "Tags" }
        ];
      } else if (activeTab.value === "comments") {
        mainOptions.value = [
          { value: "type", name: "Comment_Type", type: "array", filterOn: "type" },
        ];
      } else if (activeTab.value === "links") {
        mainOptions.value = [
          { value: "ProjectID", name: "Project", type: "array", filterOn: "_id" },
        ];
      } else if (activeTab.value === "files") {
        mainOptions.value = [
          { value: "ProjectID", name: "Project", type: "array", filterOn: "_id" },
        ];
      }
    }
  }
);

const { getTeamsData } = useGetterFunctions();

// Mounted
onMounted(() => {
  addRow();
  getData();
  getFiltersData();
});

const getData = () => {
  loading.value = false;
  if (!projectsGetter.value || !Object.keys(projectsGetter.value).length) {
    getTeamsData()
      .then((response) => {
        const uid = companyUserDetail.value.userId;
        const filterteam = response.filter(
          (x) => x.assigneeUsersArray.indexOf(uid) !== -1
        );
        const teamIds = filterteam.map((x) => "tId_" + x._id);
        let publicQuery = {
          isPrivateSpace: false,
        };
        if (
          companyUserDetail.value.roleType !== 1 &&
          companyUserDetail.value.roleType !== 2 &&
          !getters["settings/rules"].toggle.showAllProjects
        ) {
          publicQuery.AssigneeUserId = {
            $in: [uid],
          };
          if (teamIds && teamIds.length) {
            publicQuery.AssigneeUserId.$in = [
              ...publicQuery.AssigneeUserId.$in.concat(teamIds),
            ];
          }
        }
        let privateQuery = {
          isPrivateSpace: true,
        };
        if (
          companyUserDetail.value.roleType !== 1 &&
          companyUserDetail.value.roleType !== 2
        ) {
          privateQuery.AssigneeUserId = {
            $in: [uid],
          };
          if (teamIds && teamIds.length) {
            privateQuery.AssigneeUserId.$in = [
              ...privateQuery.AssigneeUserId.$in.concat(teamIds),
            ];
          }
        }
        const roleType = companyUserDetail.value.roleType;
        if (checkPermission("project.project_list") !== null) {
          dispatch("projectData/setProjects", {
            ...(checkPermission("project.public_projects") === true ? publicQuery : {}),
            restrictPublic: checkPermission("project.public_projects") !== true,
            privateQuery,
            roleType,
            uid,
          })
            .then(() => {
              loading.value = true;
              allProjectsArray.value = projectsGetter.value.data
                ? [...projectsGetter.value.data]
                : [];
              allProjectsArrayFilter.value = projectsGetter.value.data
                ? [...projectsGetter.value.data]
                : [];
              if (allProjectsArray.value && allProjectsArray.value.length) {
                // harmit told to put static id
                allProjectsArray.value = allProjectsArray.value.filter(
                  (x) => x._id !== "6571e7195470e64b1203295c" && !x.isRestrict
                );
                ProjectIdArray.value = allProjectsArray.value.map((obj) =>
                  obj._id
                );
                debouncer(100).then(async () => {
                  searchTasks();
                });
              }
              if (allProjectsArrayFilter.value && allProjectsArrayFilter.value.length) {
                // harmit told to put static id
                allProjectsArrayFilter.value = allProjectsArrayFilter.value.filter(
                  (x) => x._id !== "6571e7195470e64b1203295c" && !x.isRestrict
                );
              }
            })
            .catch((error) => {
              loading.value = true;
              console.error("ERROR in setProjects: ", error);
            });
        }
      })
      .catch((error) => {
        console.error(error, "ERROR IN GET TEAMS DATA");
      });
  } else {
    loading.value = true;
    allProjectsArray.value = [...projectsGetter.value.data];
    allProjectsArrayFilter.value = [...projectsGetter.value.data];
    if (allProjectsArray.value && allProjectsArray.value.length) {
      // harmit told to put static id
      allProjectsArray.value = allProjectsArray.value.filter(
        (x) => x._id !== "6571e7195470e64b1203295c" && !x.isRestrict
      );
      ProjectIdArray.value = allProjectsArray.value.map((obj) => obj._id);
      debouncer(100).then(async () => {
        searchTasks();
      });
    }
    if (allProjectsArrayFilter.value && allProjectsArrayFilter.value.length) {
      // harmit told to put static id
      allProjectsArrayFilter.value = allProjectsArrayFilter.value.filter(
        (x) => x._id !== "6571e7195470e64b1203295c" && !x.isRestrict
      );
    }
  }
};
// Search data from task
const searchTasks = async () => {
  try {
    const start = new Date();
    if (searchResults.value && searchResults.value.length) {
      isLoading.value = false;
    } else {
      isLoading.value = true;
    }

    const params = {
      searchText: searchText.value,
      filterQuery: filterQuery.value,
      pids: ProjectIdArray.value,
      skip: skip.value,
      batchSize: batchSize.value,
      sortBy: dropDownOptionValue.value,
      userId: userIdValue.value,
      roleType: companyUserDetail?.value?.roleType || ''
    }

    const result = await apiRequest("post", `${env.ADVANCE_GLOBAL_FILTER}/search/tasks`, params);

    if (result.data && result.data.status) {
      if (activeTab.value === "tasks") {
        if (result.data.data.length) {
          if (searchResults.value.length <= 0) {
            const end = new Date();
            const elapsedTimeInSeconds = (end - start) / 1000;
            searchResultSecond.value = elapsedTimeInSeconds.toFixed(2);
          }
          result.data.data.forEach((e) => {
            searchResults.value.push(e);
          });
          isLoading.value = false;
        }
        isLoading.value = false;
      } else {
        isLoading.value = false;
      }
    }
  } catch (error) {
    isLoading.value = false;
    console.error("ERROR in search task", error);
  }
};

// Search data from comments
const searchComments = async () => {
  try {
    const start = new Date();
    if (searchResults.value && searchResults.value.length) {
      isLoading.value = false;
    } else {
      isLoading.value = true;
    }

    const params = {
      searchText: searchText.value,
      filterQuery: filterQuery.value,
      pids: ProjectIdArray.value,
      skip: skip.value,
      batchSize: batchSize.value,
      sortBy: dropDownOptionValue.value,
      userId: userIdValue.value,
      roleType: companyUserDetail?.value?.roleType || ''
    }

    const result = await apiRequest("post", `${env.ADVANCE_GLOBAL_FILTER}/search/comments`, params);

    if (result.data && result.data.status) {
      if (activeTab.value === "comments") {
        if (result.data.data.length) {
          if (searchResults.value.length <= 0) {
            const end = new Date();
            const elapsedTimeInSeconds = (end - start) / 1000;
            searchResultSecond.value = elapsedTimeInSeconds.toFixed(2);
          }
          result.data.data.forEach((e) => {
            searchResults.value.push(e);
          });
          isLoading.value = false;
        }
        isLoading.value = false;
      } else {
        isLoading.value = false;
      }
    }

  } catch (err) {
    isLoading.value = false;
    console.error("ERROR", err);
  }
};

// Search data form project
const searchProject = async () => {
  try {
    const start = new Date();
    if (searchResults.value && searchResults.value.length) {
      isLoading.value = false;
    } else {
      isLoading.value = true;
    }

      const uid = companyUserDetail.value.userId;
      let publicQuery = {
        isPrivateSpace: false,
      };
      let privateQuery = {
        isPrivateSpace: true,
      };
      if (
        companyUserDetail.value.roleType !== 1 &&
        companyUserDetail.value.roleType !== 2 &&
        !getters["settings/rules"].toggle.showAllProjects
      ) {
        publicQuery.AssigneeUserId = {
          $in: [uid],
        };
      }
      if (
        companyUserDetail.value.roleType !== 1 &&
        companyUserDetail.value.roleType !== 2
      ) {
        privateQuery.AssigneeUserId = {
          $in: [uid],
        };
      }
      privateQuery.deletedStatusKey = { $nin: [1] };
      publicQuery.deletedStatusKey = { $nin: [1] };
      await getTeamsData()
        .then((response) => {
          const filterteam = response.filter(
            (x) => x.assigneeUsersArray.indexOf(uid) !== -1
          );
          const teamIds = filterteam.map((x) => "tId_" + x._id);
          if (
            companyUserDetail.value.roleType !== 1 &&
            companyUserDetail.value.roleType !== 2 &&
            !getters["settings/rules"].toggle.showAllProjects
          ) {
            if (teamIds && teamIds.length) {
              publicQuery.AssigneeUserId.$in = [
                ...publicQuery.AssigneeUserId.$in.concat(teamIds),
              ];
            }
          }
          if (
            companyUserDetail.value.roleType !== 1 &&
            companyUserDetail.value.roleType !== 2
          ) {
            if (teamIds && teamIds.length) {
              privateQuery.AssigneeUserId.$in = [
                ...privateQuery.AssigneeUserId.$in.concat(teamIds),
              ];
            }
          }
        })
        .catch((error) => {
          console.error(error, "ERROR IN GET TEAMS DATA");
        });

    const params = {
      searchText: searchText.value,
      filterQuery: filterQuery.value,
      publicQuery: publicQuery,
      privateQuery: privateQuery,
      skipValue: skip.value,
      batchSizeValue: batchSize.value,
      sortBy: dropDownOptionValue.value,
    }

    const result = await apiRequest("post", `${env.ADVANCE_GLOBAL_FILTER}/search/projects`, params);

    if (result.data && result.data.status) {
      if (activeTab.value === "project") {
        if (result.data.data.length) {
          if (searchResults.value.length <= 0) {
            const end = new Date();
            const elapsedTimeInSeconds = (end - start) / 1000;
            searchResultSecond.value = elapsedTimeInSeconds.toFixed(2);
          }
          result.data.data.forEach((e) => {
            searchResults.value.push(e);
          });
          isLoading.value = false;
        }
        isLoading.value = false;
      } else {
        isLoading.value = false;
      }
    }

  } catch (err) {
    isLoading.value = false;
    console.error("ERROR", err);
  }
};
// Search data for link form project, task and comment collection
const searchLink = async() => {
    try {
      if(searchResults.value && searchResults.value.length){
        isLoading.value = false;
      }else{
        isLoading.value = true;
      }

      const params = {
        filterQuery: filterQuery.value,
        pids: ProjectIdArray.value,
        skipValue: skip.value,
        batchSizeValue: batchSize.value,
        sortBy: dropDownOptionValue.value,
      }

      const result = await apiRequest("post", `${env.ADVANCE_GLOBAL_FILTER}/search/links`, params);

      if (result.data && result.data.status) {
        if (activeTab.value === "links") {
          if (result.data.data.length) {
            result.data.data.forEach((e) => {
              searchResults.value.push(e);
            });
            isLoading.value = false;
          }
          isLoading.value = false;
        } else {
          isLoading.value = false;
        }
      }
    } catch(error) {
      isLoading.value = false;
      console.error("ERROR",error);
    }
}
// Search data for Files form project, task and comment collection
const searchFiles = async () => {
  try {
    isLoading.value = true;

    const params = {
      filterQuery: filterQuery.value,
      pids: ProjectIdArray.value,
      skipValue: skip.value,
      batchSizeValue: batchSize.value,
      sortBy: dropDownOptionValue.value,
    }

    const result = await apiRequest("post", `${env.ADVANCE_GLOBAL_FILTER}/search/files`, params);

    if (result.data && result.data.status) {
      if (activeTab.value === "files") {
        if (result.data.data.length) {
          result.data.data.forEach((e) => {
            searchResults.value.push(e);
          });
          isLoading.value = false;
        }
        isLoading.value = false;
      } else {
        isLoading.value = false;
      }
    }
  } catch (error) {
    isLoading.value = false;
    console.error("ERROR", error);
  }
};
// right side filter
/**
 * This function is used to add new row
 */
const addRow = () => {
  if (!validateItems()) {
    isValidate.value = false;
    return;
  }

  isValidate.value = true;
  const obj = {
    name: {},
    comparison: {},
    values: [],
    condition: inputs.value.length > 0 ? inputs.value[0].condition : "&&",
    date: "",
    isAllChecked: false,
    isValidate: true,
    displayData: [],
    comparisonsData: [],
  };
  inputs.value.push(obj);

  nextTick(() => {
    if (inputs.value.length > 5) {
      const el = document.querySelector(`#num-${inputs.value.length - 1}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "end" });
      }
    }
  });
};

/**
 * This function is used to validate each fields in the tables
 */
const validateItems = () => {
  let isValid = true; // Assume the array is valid initially

  inputs.value.forEach((item) => {
    item.isValidate = true;

    if (typeof item.name !== "object" || Object.keys(item.name).length === 0) {
      item.isValidate = false;
    }
    if (
      typeof item.comparison !== "object" ||
      Object.keys(item.comparison).length === 0
    ) {
      item.isValidate = false;
    }
    if (item.name.value === "DueDate") {
      if (item.date === "") {
        item.isValidate = false;
      }
    } else {
      if (!Array.isArray(item.values) || item.values.length === 0) {
        item.isValidate = false;
      }
    }
    if (item.isValidate === false) {
      isValid = false;
    }
  });
  return isValid;
};

const deleteRow = async (row) => {
  let filterBy = {};
  let queries = [];
  inputs.value.splice(row.index, 1);
  if (activeTab.value === "tasks") {
    if (
      inputs.value &&
      inputs.value.length &&
      inputs.value[0].displayData &&
      inputs.value[0].displayData.length
    ) {
      queries = JSON.parse(JSON.stringify(inputs.value));
      inputQueries(queries, filterBy);
    } else {
      filterQuery.value = filterBy;
      debouncer(1000).then(async () => {
        await searchTasks();
      });
    }
  } else if (activeTab.value === "project") {
    if (
      inputs.value &&
      inputs.value.length &&
      inputs.value[0].displayData &&
      inputs.value[0].displayData.length
    ) {
      queries = JSON.parse(JSON.stringify(inputs.value));
      inputQueries(queries, filterBy);
    } else {
      filterQuery.value = filterBy;
      debouncer(1000).then(async () => {
        await searchProject();
      });
    }
  } else if (activeTab.value === "comments") {
    if (
      inputs.value &&
      inputs.value.length &&
      inputs.value[0].displayData &&
      inputs.value[0].displayData.length
    ) {
      queries = JSON.parse(JSON.stringify(inputs.value));
      inputQueries(queries, filterBy);
    } else {
      filterQuery.value = filterBy;
      debouncer(1000).then(async () => {
        await searchComments();
      });
    }
  } else if (activeTab.value === "links") {
    if (
      inputs.value &&
      inputs.value.length &&
      inputs.value[0].displayData &&
      inputs.value[0].displayData.length
    ) {
      queries = JSON.parse(JSON.stringify(inputs.value));
      inputQueries(queries, filterBy);
    } else {
      filterQuery.value = filterBy;
      debouncer(1000).then(async () => {
        await searchLink();
      });
    }
  } else if (activeTab.value === "files") {
    if (
      inputs.value &&
      inputs.value.length &&
      inputs.value[0].displayData &&
      inputs.value[0].displayData.length
    ) {
      queries = JSON.parse(JSON.stringify(inputs.value));
      inputQueries(queries, filterBy);
    } else {
      filterQuery.value = filterBy;
      debouncer(1000).then(async () => {
        await searchFiles();
      });
    }
  }
};

/**
 * This function is used to save the filter to the database
 */
const saveFilter = async (inputName) => {
  if (inputName === "") {
    isInvalid.value = true;
    return;
  } else {
    if (!validateItems()) {
      isValidate.value = false;
      return;
    }
  }
  isValidate.value = true;
  isInvalid.value = false;
  const arr = JSON.parse(JSON.stringify(inputs.value));
  arr.forEach((key) => {
    delete key.displayData;
    delete key.isValidate;
    delete key.comparisonsData;
  });

  const axiosData = {
    name: inputName,
    filters: arr,
    userId: userIdValue.value,
    companyId: companyId.value,
    typeFilter: activeTab.value,
    filter: "advancedFilter",
    updatedAt: new Date(),
    createdAt: new Date(),
  };
  await apiRequest("post", `${env.ADVANCE_GLOBAL_FILTER}/create`, axiosData).then((result) => {
    if (result.status) {
      getFiltersData()
      $toast.success(t('Toast.Filter_saved_successfully'), { position: 'top-right' });
    }
  });
};
const updateFilter = async () => {
  // Validate if any field is blank or not
  if (!validateItems()) {
    isValidate.value = false;
    return;
  }
  isValidate.value = true;
  const arr = JSON.parse(JSON.stringify(inputs.value));
  arr.forEach((key) => {
    delete key.displayData;
    delete key.isValidate;
    delete key.comparisonsData;
  });

  const obj = { filters: arr, id: selectedRow.value._id };
  await handleUpdate(obj);
};
const handleUpdate = async (obj) => {
  let params = [
      { _id: obj.id },
      { $set: obj?.name ? { name: obj.name } : { filters: obj.filters } }
  ]

  await apiRequest("put", `${env.TASK_GLOBAL_FILTER}/update`, params).then((result) => {
    if (result.status) {
      const index = filters.value.findIndex((x) => x._id === obj.id);
      if (index !== -1) {
        if (obj?.name) {
          filters.value[index].name = obj.name;
        } else {
          filters.value[index].filters = obj.filters;
        }
      }
      $toast.success(t("Toast.Filter_update_successfully"), { position: "top-right" });
    }
  });
};
const deleteFilter = (row) => {
  isConfirm.value = true;
  isEdit.value = false;
  selectedRow.value = row;
};
const handleConfirm = async (val) => {
  if (val) {
    isConfirm.value = false;
    await apiRequest("delete", `${env.ADVANCE_GLOBAL_FILTER}/delete/${companyId.value}/${selectedRow.value._id}`).then((result) => {
      if (result.status) {
        const index = filters.value.findIndex((x) => x._id === selectedRow.value._id);
        if (index !== -1) {
            filters.value.splice(index, 1);
        }
        $toast.success(t("Toast.Filter_deleted_successfully"), { position: "top-right" });
        clearFilter();
      }
    });
  }
};
const getFiltersData = async () => {
  try {
    const result = await apiRequest("get", `${env.ADVANCE_GLOBAL_FILTER}/${userIdValue.value}/${activeTab.value}`);
    if (result.data.status) {
      filters.value = [];
      if (result && result.data.data.length) {
        result.data.data.forEach((doc) => {
          filters.value.push({ ...doc, isEdit: false });
        });
      }
    }
  } catch (error) {
    console.error("Error fetching filters data:", error);
  }
};

// This function is used for the get remaining comments data on scroll from the mongo
const onScroll = (e) => {
  debouncer(1000).then(async () => {
    if (e.target.scrollTop >= e.target.scrollHeight - e.target.clientHeight - 250) {
      skip.value += batchSize.value;
      if (activeTab.value === "comments") {
        await searchComments();
      } else if (activeTab.value === "tasks") {
        await searchTasks();
      } else if (activeTab.value === "project") {
        await searchProject();
      } else if (activeTab.value === "links") {
        await searchLink();
      } else if (activeTab.value === "files") {
        await searchFiles();
      }
    }
  });
};

function debouncer(timeout = 1000) {
  return new Promise((resolve) => {
    if (timer.value) {
      clearTimeout(timer.value);
    }
    timer.value = setTimeout(() => {
      resolve();
    }, timeout);
  });
}

/**
 * This function is used to perfom filter based on selected fields
 * @param {String} query
 */
const applyFilter = async (data) => {
  isValidate.value = true;
  let filterBy = {};
  let queries = [];
  if (data.type === "saved") {
    inputs.value = [];
    isEdit.value = true;
    selectedRow.value = data.item;
    queries = JSON.parse(JSON.stringify(data.item.filters));
    queries.map((x) => (x.comparisonsData = manageComparisonArray(x.name.value)));
    queries.map(
      (x) =>
        (x.displayData =
          x.name.value !== "DueDate"
            ? manageArray(x.name.value).value.filter((v) =>
                x.values.includes(v.finalValue)
              )
            : [])
    );
    nextTick(() => {
      inputs.value = queries;
    });
    inputQueries(queries, filterBy);
  } else {
    if (!validateItems()) {
      isValidate.value = false;
      let filteredInput = inputs.value.filter((x) => x.isValidate === true);
      if (filteredInput && filteredInput.length) {
        queries = JSON.parse(JSON.stringify(filteredInput));
        inputQueries(queries, filterBy);
      } else {
        isLoading.value = true;
        debouncer(1000).then(async () => {
          skip.value = 0;
          batchSize.value = 20;
          filterQuery.value = {};
          searchResults.value = [];
          searchResultTotal.value = "";
          searchResultSecond.value = "";
          if (activeTab.value === "tasks") {
            await searchTasks();
          } else if (activeTab.value === "project") {
            await searchProject();
          } else if (activeTab.value === "comments") {
            await searchComments();
          } else if (activeTab.value === "links") {
            await searchLink();
          } else if (activeTab.value === "files") {
            await searchFiles();
          }
        });
      }
      return;
    }
    queries = JSON.parse(JSON.stringify(inputs.value));
    inputQueries(queries, filterBy);
  }
};

const inputQueries = async (queries, filterBy) => {
  if (queries && queries.length) {
    queries.forEach((query) => {
      const queryField = query.name.value;
      const comparison = query.comparison.value;
      const condition = query.condition === "||" ? "$or" : "$and";
      const filterOn = query.name.filterOn;
      if (filterBy[condition] === undefined) {
        filterBy[condition] = [];
      }
      if (query.name.type === "arrayOfObject") {
        filterBy[condition].push({
          [queryField]: { $elemMatch: { [filterOn]: { $in: query.values } } },
        });
      } else if (query.name.type === "object") {
        const filteField = `${queryField}.${filterOn}`;
        filterBy[condition].push({ [filteField]: { $in: query.values } });
      } else if (query.name.type === "string" || query.name.type === "array") {
        if (filterOn === "ProjectID" || filterOn === "_id") {
          filterBy[condition].push({
            [filterOn]: {objId: {$in: query.values.map((x) => x)} },
          });
        } else {
          if(comparison == ':!=') {
              filterBy[condition].push({ [filterOn]: { $nin: query.values } });
          } else {
            filterBy[condition].push({ [filterOn]: { $in: query.values } });
          }
        }
      } else if (query.name.type === "date") {
        const date = new Date(query.date);
        const now = moment(new Date(query.date));
        const nextDate = new Date(now.endOf("day"));
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        if (comparison === ":=") {
          const startDate = new Date(query.date).setHours(0, 0, 0, 0);
          const endDate = new Date(query.date).setHours(23, 59, 59, 59);
          filterBy[condition].push({
            [filterOn]: { dbDate: { $gte: new Date(startDate), $lte: new Date(endDate)} },
          });
        } else if (comparison === ":>") {
          filterBy[condition].push({ [filterOn]: { dbDate: { $gt: new Date(nextDate)} } });
        } else {
          filterBy[condition].push({ [filterOn]: { dbDate: { $lt: new Date(date)} } });
        }
      } else if (query.name.type === "dateNumber") {
        const date = new Date(query.date);
        const now = moment(new Date(query.date));
        const nextDate = new Date(now.endOf("day"));
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        if (comparison === ":=") {
          const startDate = new Date(query.date).setHours(0, 0, 0, 0);
          const endDate = new Date(query.date).setHours(23, 59, 59, 59);
          filterBy[condition].push({
            [filterOn]: {
              $gte: new Date(startDate).getTime() / 1000,
              $lte: new Date(endDate).getTime() / 1000,
            },
          });
        } else if (comparison === ":>") {
          filterBy[condition].push({
            [filterOn]: { $gt: new Date(nextDate).getTime() / 1000 },
          });
        } else {
          filterBy[condition].push({
            [filterOn]: { $lt: new Date(date).getTime() / 1000 },
          });
        }
      } else {
        filterBy = { ...filterBy };
      }
    });
  }
  emit("apply", filterBy);
  skip.value = 0;
  batchSize.value = 20;
  isApplyed.value = true;
  searchResults.value = [];
  filterQuery.value = filterBy;
  searchResultTotal.value = "";
  searchResultSecond.value = "";
  isLoading.value = true;
  debouncer(1000).then(async () => {
    if (activeTab.value === "project") {
      await searchProject();
    } else if (activeTab.value === "tasks") {
      await searchTasks();
    } else if (activeTab.value === "comments") {
      await searchComments();
    } else if (activeTab.value === "links") {
      await searchLink();
    } else if (activeTab.value === "files") {
      await searchFiles();
    }
  });
};

const manageComparisonArray = (key) => {
  const arraykeys = [
    "Task_Priority",
    "Task_Leader",
    "AssigneeUserId",
    "ProjectID",
    "ProjectType",
    "MilestoneType",
    "ProjectCurrency",
    "type",
  ];
  const dateKeys = ["DueDate"];
  const statusKeys = ["statusKey","status"];
  let arrayData = [];
  if (arraykeys.includes(key)) {
    arrayData = [{ value: ":", name: "Is" }];
  } else if (dateKeys.includes(key)) {
    arrayData = [
      { value: ":>", name: "Greater Than" },
      { value: ":<", name: "Less Than" },
      { value: ":=", name: "Equal To" },
    ];
  }
  else if(statusKeys.includes(key)) {
    arrayData = [
      { value: ':=', name: "Is" },
      { value: ':!=', name: "Not_Equals_To" },
    ]
  }
  return arrayData;
};
const manageArray = (type) => {
  let arrayData = [];
  if (type === "statusKey") {
    arrayData = statusArray;
  } else if (type === "Task_Priority") {
    arrayData = prioritiesArray;
  } else if (type === "Task_Leader") {
    arrayData = usersDetail;
  } else if (type === "AssigneeUserId") {
    arrayData = usersDetail;
  } else if (type === "ProjectID") {
    arrayData = allProjectsFilter;
  } else if (type === "ProjectType") {
    arrayData = projectType;
  } else if (type === "MilestoneType") {
    arrayData = milestoneType;
  } else if (type === "ProjectCurrency") {
    arrayData = allCurrency;
  } else if (type === "status") {
    arrayData = allProjectStatus;
  } else if (type === "type") {
    arrayData = commentType;
  }
  return arrayData;
};
const clearFilter = async () => {
  isLoading.value = true;
  inputs.value = [];
  addRow();
  emit("clear", true);
  isValidate.value = true;
  isEdit.value = false;
  isApplyed.value = false;
  filterQuery.value = {};
  skip.value = 0;
  batchSize.value = 20;
  searchResults.value = [];
  searchResultTotal.value = "";
  searchResultSecond.value = "";
  debouncer(1000).then(async () => {
    if (activeTab.value === "tasks") {
      await searchTasks();
    } else if (activeTab.value === "project") {
      await searchProject();
    } else if (activeTab.value === "comments") {
      await searchComments();
    } else if (activeTab.value === "links") {
      await searchLink();
    } else if (activeTab.value === "files") {
      await searchFiles();
    }
  });
};
const projectTab = async () => {
  searchResults.value = [];
  activeTab.value = "project";
  dropDownOptionValue.value = "last_created";
  clearFilter();
  getFiltersData();
};
const linkTab = async () => {
  searchResults.value = [];
  activeTab.value = "links";
  dropDownOptionValue.value = "last_created";
  clearFilter();
  getFiltersData();
};
const taskTab = () => {
  searchResults.value = [];
  activeTab.value = "tasks";
  dropDownOptionValue.value = "last_update";
  clearFilter();
  getFiltersData();
};
const filetab = () => {
  searchResults.value = [];
  activeTab.value = "files";
  dropDownOptionValue.value = "last_update";
  clearFilter();
  getFiltersData();
};
const commentTab = () => {
  searchResults.value = [];
  activeTab.value = "comments";
  dropDownOptionValue.value = "last_update";
  clearFilter();
  getFiltersData();
};
const dropDownFilter = async () => {
  skip.value = 0;
  batchSize.value = 20;
  searchResults.value = [];
  searchResultTotal.value = "";
  searchResultSecond.value = "";
  debouncer(1000).then(async () => {
    if (activeTab.value === "comments") {
      await searchComments();
    } else if (activeTab.value === "tasks") {
      await searchTasks();
    } else if (activeTab.value === "project") {
      await searchProject();
    } else if (activeTab.value === "links") {
      await searchLink();
    } else if (activeTab.value === "files") {
      await searchFiles();
    }
  });
};
const toggleSidebar = () => {
  filterSidebar.value = !filterSidebar.value;
};
</script>
<style scoped>
.alert-danger {
  color: #721c24;
  background-color: #f8d7da;
  border-color: #f5c6cb;
}
.alert-danger {
  color: #721c24;
  background-color: #f8d7da;
  border-color: #f5c6cb;
}
.alert {
  position: relative;
  padding: 0.75rem 1.25rem;
  margin-top: 10px;
  margin-bottom: 0px;
  border: 1px solid transparent;
  border-radius: 0.25rem;
}
.wrapper_table_data_padding_fields {
  padding: 0px 15px 0px 15px;
  overflow: auto;
}
.table-data {
  overflow: inherit;
}
.add-section-table {
  padding: 15px;
}
.add-section-table a {
  line-height: 23.68px;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
.cancel__icon {
  width: 10px;
  height: 10px;
}
.w-16px {
  width: 16px;
}
</style>
