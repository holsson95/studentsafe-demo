<template>
  <div class="tag-input">
    <div class="input-area" v-if="mode === 'single' && !readonly">
      <textarea
        v-model="newInput"
        @keyup.enter="addInput"
        placeholder="Input Text"
      ></textarea>
      <button class="add-btn" @click="addInput">Add</button>
    </div>
    <div class="input-area" v-if="mode === 'twoColumn' && !readonly">
        <div class="inline-field">
            <input
                v-model="newName"
                placeholder="Name"
            />
            <select v-model="newRole">
                <option value="" disabled>Select Role</option>
                <option v-for="role in roles" :key="role.id" :value="role.id">{{ role.name }}</option>
                <!-- Import Roles from Backend Later -->
            </select>
        </div>
        <button class="add-btn" @click="addTwoColumnInput">Add</button>
    </div>
    <ul v-if="mode === 'single'">
      <li v-for="(item, index) in inputs" :key="index">
        <span class="bullet">{{ item }}</span>
        <span class="delete" v-if="!readonly" @click="removeInput(index)"><Icon icon="line-md:trash" class="icon"/></span>
      </li>
    </ul>
    <ul v-else-if="mode === 'twoColumn'">
      <li v-for="(item, index) in twoColumnInputs" :key="index">
        <div class="name-role-container">
          <div class = "field-value">{{ item.name }}</div>
        </div>
        <div class="name-role-container">
          <div class = "field-value">{{ roles.find(r => r.id === item.role)?.name || item.role }}</div>
        </div>
        <span class="delete" v-if="!readonly" @click="removeTwoColumnInput(index)"><Icon icon="line-md:trash" class="icon"/></span>
      </li>
    </ul>
  </div>
</template>

<script>
import { ref, watch } from 'vue';

export default {
    props:{
        mode: {
            type: String, 
            required: true,
            validator: value => ['single', 'twoColumn'].includes(value)
        },
        roles: {
          type: Array,
          default: () => []
        },
        modelValue: {
          type: Array,
          default: () => []
        },
        readonly: {
          type: Boolean,
          default: false
        }
    },
    setup(props, { emit }) {
        const newInput = ref('');
        const inputs = ref([...props.modelValue]);
        watch(() => props.modelValue, (val) => {
          if(JSON.stringify(val) !== JSON.stringify(inputs.value)){
          inputs.value = val ? [...val] : [];
          }
        }, { deep: true });
        const newName = ref('');
        const newRole = ref('');
        const twoColumnInputs = ref([...props.modelValue]);
        watch(() => props.modelValue, (val) =>{
          if(JSON.stringify(val) !== JSON.stringify(twoColumnInputs.value)) {
          twoColumnInputs.value = val ? [...val] : [];
          }
        }, { deep: true });

        const addInput = () => {
        if (newInput.value.trim() !== '') {
            inputs.value.push(newInput.value);
            newInput.value = '';
            emit('update:modelValue', inputs.value);
        }
        };
        const removeInput = (index) => {
            inputs.value.splice(index, 1);
            emit('update:modelValue', inputs.value);
        };
        const addTwoColumnInput = () => {
            if (newName.value.trim() !== '' && newRole.value != null && newRole.value !== '') {
                twoColumnInputs.value.push({name: newName.value, role: newRole.value})
                newName.value = '';
                newRole.value = '';
                emit('update:modelValue', twoColumnInputs.value);
            }
        };

        const removeTwoColumnInput = (index) => {
            const updated = twoColumnInputs.value.filter((_, i) => i !== index);
            twoColumnInputs.value = updated;
            emit('update:modelValue', twoColumnInputs.value);

        };
        return {
        newInput,
        inputs,
        newName,
        newRole,
        twoColumnInputs,
        addInput,
        addTwoColumnInput,
        removeInput,
        removeTwoColumnInput
        };
    },
};
</script>

<style scoped>
.tag-input {
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-bottom: 1rem;
}
.inline-field {
  display: flex;
  gap: 10px; /* Add space between fields */
  width: 100%; /* Use full available width */
}

.inline-field input,
.inline-field select {
  flex: 1; /* Allow fields to share available space equally */
  min-height: 30px; /* Make the height consistent */
  border: 1px solid #ccc;
  border-radius: 10px;
  padding: 0.5rem;
  font-size: 1rem;
  box-sizing: border-box;
}
.name-role-container {
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
  width: 100%;
}

.input-area {
  display: flex;
  align-items: flex-end;
  gap: 10px; /* space between textarea and button */
  width: 100%;
}

textarea {
  flex: 1;
  border: 1px solid #ccc;
  border-radius: 10px;
  padding: 0.5rem;
  font-size: 1rem;
  resize: vertical;
  min-height: 60px;
}

/* Style the Add button */
.add-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  background-color: #4CAF50; /* adjust to match your theme */
  color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.add-btn:hover {
  background-color: #45a049; /* darker shade on hover */
}

ul {
  list-style: none;
  padding: 0;
}

li {
  display: flex;
  justify-content: flex;
  align-items: center;
  margin: 5px 0;
  text-align: left;
}

.bullet {
  margin-right: 8px;
  text-align: left;
  width: 100%;
  padding-left: .5rem;
}

.delete {
  cursor: pointer;
  margin-left: 10px;
  font-size: 1.2rem;
  transition: color 0.2s;
  text-align: right;
}

.delete:hover {
  color: red;
}
</style>
