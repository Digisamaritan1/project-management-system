<!-- 
  **Steps for Adding and Managing a New Tour:**

  Note :- "key" = Database Tour ID

  1. **Define the Tour Key:**
    - The key for the tour corresponds to the tour ID in the database (DB). Make sure you have the correct key before starting.

  2. **Add Tour Steps in the JSON File:**
    - When a new tour is introduced, the steps must be added to a JSON configuration file. with proper element IDs

  3. **Start the Tour:**
    - In the `store tour action` getter, define the key associated with the tour in the database.
    - If the tour begins with a popup, you need to include the title and message that should be displayed.(getTours function) Make sure you have added data in localization files.

  4. **Start the Tour Execution:**
    - To start a tour that begins with a popup, call `mainTour.value.handleTour(key);`.
    - For a tour that doesn't start with a popup, call `startProjectTour()`.

  5. **Add Tour Steps in the Helper File:**
    - In the helper file (e.g., `frontend\src\components\organisms\Tour\helper.js`), under the `handleTours` function, configure the steps for the tour.
    - Use a condition based on the tour key to handle specific steps for each tour.

  6. **Update Navigation Handlers:**
    - Update the `onPrevClickHandler` and `onNextClickHandler` functions to handle navigation through the tour steps.
    - The first parameter of these functions should indicate which tour is currently active, to ensure correct handling of the steps for each tour.
    - Update the `updateTourStatusInUser` function to mark the tour as completed in the user's database. which parems is db tour ID(key).
    - You can manage clicks operation inside Navigation function for referance check functions.
-->

 <template>
  <div>
    <ConfirmModal
      :modelValue="showProjectTourModal"
      className="projecttour_driver_modal"
      :acceptButtonText="$t('Tour.lets_start')"
      :cancelButtonText="$t('Tour.no_thanks')"
      :showCloseIcon="false"
      :header="true"
      :closeOnBackdrop="false"
      :title="currentTourKey"
      @accept="()=> {startProjectTour(currentTourKey);showProjectTourModal = false}" 
      @close="() => {updateTourStatusInUser(currentTourKey);showProjectTourModal = false}"
    >
      <template #header>
        <span>{{tourTitle}}</span>
        <img
          :src="cancelIconForTour"
          class="cursor-pointer cancel__icon-img"
          alt="close"
          @click.prevent="() => {closeIconTaskHandler(currentTourKey);showProjectTourModal = false;handleTourOpenManual(currentTourKey)}"
        >
      </template>
      <template #body>
        <span>{{tourMessage}}</span>
      </template>
    </ConfirmModal>
  </div>
</template>

<script setup>
import ConfirmModal from '@/components/atom/Modal/Modal.vue';
import { tourHepler } from "@/components/organisms/Tour/helper";
import { computed } from 'vue';
import { ref } from 'vue';
import { useStore } from "vuex";
import { useI18n } from "vue-i18n";
const { t } = useI18n();
const {getters} = useStore();
const showProjectTourModal = ref(false);
const { startProjectTour, updateTourStatusInUser, hanldeProjectTour, closeIconTaskHandler,handleTourOpenManual } = tourHepler();
const cancelIconForTour = require("@/assets/images/cancel_icon.png");
const currentTourKey = ref('');
const tourMessage = ref('');
const tourTitle = ref('');
const toursGetters = computed(() => getters['ToursData/Tours']);
const brandSettings = computed(() => getters['brandSettingTab/brandSettings']);
const handleTour = (key) => {
    tourTitle.value = toursGetters?.value?.find((e)=>e.id == key)?.tourModalTitle ? (t(`Tour.${toursGetters?.value?.find((e)=>e.id == key)?.tourModalTitle}`).replace('BRAND_NAME', brandSettings.value && brandSettings.value?.productName ? brandSettings.value.productName : 'Alian Hub')) : '';
    tourMessage.value = toursGetters?.value?.find((e)=>e.id == key)?.tourModalMessage ? (t(`Tour.${toursGetters?.value?.find((e)=>e.id == key)?.tourModalMessage}`).replace('BRAND_NAME', brandSettings.value && brandSettings.value?.productName ? brandSettings.value.productName : 'Alian Hub')) : '';
    currentTourKey.value = key;
    showProjectTourModal.value = hanldeProjectTour(key);
};
defineExpose({
  handleTour
});

</script>
