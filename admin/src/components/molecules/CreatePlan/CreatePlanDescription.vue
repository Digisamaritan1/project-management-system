<template>
    <div class="createplan_wrapper">
        <div>
            <div class="inputFieldDiv">
                <label for="Description" class="createPlan_label">
                    Features Description
                </label>
                <textarea class="form-control" v-model.trim="formData.description.value"
                    style="height:100px;"
                    placeHolder="Features Description" type="text" id="Features Description" @keyup="checkErrors({
                            'field': formData.description,
                            'name': formData.description.name,
                            'validations': formData.description.rules,
                            'type': formData.description.type,
                            'event': $event.event
                        })" />
                <div class="invalid-feedback red">{{ formData.description.error }}</div>
            </div>
        </div>
    </div>
    
</template>
<script setup>
    import { useValidation } from "@/composable/Validation.js";
    const formData = defineModel()

    const { checkErrors } = useValidation();
</script>
<style scoped src="./style.css"></style>