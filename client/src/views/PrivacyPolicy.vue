<template>
  <div class="privacy-policy">
    <!-- Top banner -->
    <!-- Profile info section -->
    <div class="policy-container">
    <div class="banner">
        <h1>Privacy Policy</h1>
        <p>Effective date: July 2026</p>
    </div>
      <section id="introduction" :class="{ active: activeSection === 'introduction' }">
        <h2>1. Introduction</h2>
        <p>The Safeguarding System is designed to assist 
          authorized schools and safeguarding personnel 
          in managing safeguarding concerns, documenting interventions, 
          monitoring case progress, and supporting student welfare. 
          This Privacy Policy explains how information is collected, 
          used, stored, protected, and disclosed while using the system. 
          We are committed to handling personal information responsibly 
          and maintaining the confidentiality of safeguarding records.</p>
      </section>
    <section id="information-we-collect">
        <h2>2. Information We Collect</h2>

        <p>The system may collect the following information:</p>

        <ul>
          <li>
            <strong>User Account Information:</strong>
            Name, email address, role, and assigned school information.
          </li>

          <li>
            <strong>Safeguarding Case Information:</strong>
            Reports, concerns, case details, notes, interventions,
            and case status updates.
          </li>

          <li>
            <strong>Student Information:</strong>
            Student identifiers and relevant safeguarding-related records.
          </li>

          <li>
            <strong>Uploaded Files:</strong>
            Supporting documents or evidence submitted during case management.
          </li>

          <li>
            <strong>System Activity Information:</strong>
            Login records, actions performed, and audit logs for security purposes.
          </li>
        </ul>

      </section>


      <section id="how-we-use-information" >
        <h2>3. How We Use Information</h2>

        <p>
          Collected information is used only for authorized safeguarding
          purposes, including:
        </p>

        <ul>
          <li>Managing safeguarding reports and cases.</li>
          <li>Assigning cases to authorized personnel.</li>
          <li>Tracking interventions and resolutions.</li>
          <li>Maintaining system security and accountability.</li>
          <li>Generating reports for authorized users.</li>
        </ul>

      </section>


      <section id="information-access-and-confidentiality" >
        <h2>4. Information Access and Confidentiality</h2>

        <p>
          Access to safeguarding information is restricted based on user roles
          and permissions. Only authorized personnel may view or manage
          confidential records.
        </p>

        <p>
          Users must not copy, share, or disclose safeguarding information
          outside authorized purposes.
        </p>

      </section>


      <section id="data-protection-and-security" >
        <h2>5. Data Protection and Security</h2>

        <p>
          The system applies security measures to protect information,
          including:
        </p>

        <ul>
          <li>Secure authentication.</li>
          <li>Role-based access control.</li>
          <li>Encrypted communication through HTTPS.</li>
          <li>Activity logging and auditing.</li>
        </ul>

      </section>


      <section id="data-retention" >
        <h2>6. Data Retention</h2>

        <p>
          Safeguarding records are retained according to organizational
          requirements and may only be removed or archived by authorized
          personnel.
        </p>

      </section>


      <section id="user-responsibilities" >
        <h2>7. User Responsibilities</h2>

        <ul>
          <li>Keep login credentials secure.</li>
          <li>Use the system only for authorized purposes.</li>
          <li>Maintain confidentiality of sensitive information.</li>
          <li>Report suspicious activity or unauthorized access.</li>
        </ul>

      </section>


      <section id="contact-information" >
        <h2>8. Contact Information</h2>

        <p>
          For questions regarding privacy, security, or information handling,
          please contact the system administrator.
        </p>
      </section>
    </div>
    <aside class="toc">
        <h3>Contents</h3>
        <a href="#introduction">1. Introduction</a>
        <a href="#information-we-collect">2. Information We Collect</a>
        <a href="#how-we-use-information">3. How We Use Information</a>
        <a href="#information-access-and-confidentiality">4. Information Access and Confidentiality</a>
        <a href="#data-protection-and-security">5. Data Protection and Security</a>
        <a href="#data-retention">6. Data Retention</a>
        <a href="#user-responsibilities">7. User Responsibilities</a>
        <a href="#contact-information">8. Contact Information</a>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const activeSection = ref('');

onMounted(() => {
    const sections = document.querySelectorAll("section[id]");
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                activeSection.value = entry.target.id;
            }
        });
    }, { threshold: 0.5 });
    sections.forEach(section => observer.observe(section));
})
</script>

<style scoped>
/* Policy content spacing */

.privacy-policy {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
}

.policy-container {
  flex: 1;
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}


.policy-container section {
  margin-bottom: 2.5rem;
  padding: 0 2rem 0 2rem;
}


.policy-container h2 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #0a3186;
  font-size: 1.35rem;
}


.policy-container p {
  margin-bottom: 1rem;
  line-height: 1.7;
  color: #333;
}


.policy-container ul {
  margin-top: 0.75rem;
  margin-bottom: 1rem;
  padding-left: 1.5rem;
}


.policy-container li {
  margin-bottom: 0.6rem;
  line-height: 1.6;
}

.banner {
  height: auto;
  border-radius: 12px;
  background-color: #0a3186;
  padding: 2rem;
  color: white;
  margin-bottom: 1.5rem;
}


.banner h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  color: white;

}


.banner p {
  margin: 0.5rem 0 0;
  font-size: 0.9rem;
  font-weight: 400;
  opacity: 0.85;
  color: white;
}


/* Table of contents */

.toc {
  width: 230px;
  background: white;
  padding: 1.2rem;
  border-radius: 12px;
  position: sticky;
  top: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.toc a {
  display: block;
  padding: 0.6rem 0.8rem;
  color: #555;
  text-decoration: none;
  font-size: 0.9rem;
  border-radius: 6px;
  transition: 0.2s;
}


.toc a.active {
  background-color: #0a3186;
  color: white;
  font-weight: 600;
}


.toc a:hover {
  background-color: #e9eefc;
  color: #0a3186;
}

.toc h3 {
  color: #0a3186;
  margin-bottom: 1rem;
}

section:target {
  animation: highlight 1s ease;
}


@keyframes highlight {
  from {
    background-color: #e9eefc;
  }
  to {
    background-color: transparent;
  }
}

/* Smooth scrolling */

html {
  scroll-behavior: smooth;
}


</style>
