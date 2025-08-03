// دالة تهيئة السمة (الوضع الليلي/النهاري)
function initTheme() {
    // الحصول على زر تبديل السمة من الصفحة
    const themeToggle = document.getElementById('themeToggle');
    // جلب السمة المحفوظة من التخزين المحلي (localStorage)
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        // تعيين السمة على العنصر الجذري (html)
        document.documentElement.setAttribute('data-theme', savedTheme);
        // إذا كانت السمة المحفوظة هي الوضع الليلي، فعّل الزر
        if (savedTheme === 'dark') {
            themeToggle.checked = true;
        }
    }
    // عند تغيير السمة من قبل المستخدم
    themeToggle.addEventListener('change', () => {
        // تحديد السمة الجديدة حسب حالة الزر
        const newTheme = themeToggle.checked ? 'dark' : 'light';
        // تعيين السمة الجديدة
        document.documentElement.setAttribute('data-theme', newTheme);
        // حفظ السمة الجديدة في التخزين المحلي
        localStorage.setItem('theme', newTheme);
    });
}

// كائن يربط رموز الدرجات بقيمها النقطية حسب النظام الجامعي
const gradePoints = {
  'أ': 4.00,
  'أ-': 3.75,
  'ب+': 3.50,
  'ب': 3.00,
  'ب-': 2.75,
  'ج+': 2.50,
  'ج': 2.00,
  'ج-': 1.75,
  'د+': 1.50,
  'د': 1.25,
  'د-': 1.00,
  'هـ': 0.50,
  'old-د': 1.00,
  'old-د-': 0.75,
  'old-هـ': 0.00
};

// عداد لتتبع عدد تغييرات عدد المواد (لإعادة تحميل الصفحة بعد 4 تغييرات)
let courseChangeCounter = 0;

// دالة تهيئة مجموعات الأزرار (للاختيارات المتعددة)
function initializeButtonGroups() {
  const buttonGroups = document.querySelectorAll('.button-group');
  // لكل مجموعة أزرار
  buttonGroups.forEach(group => {
    const buttons = group.querySelectorAll('.option-button');
    buttons.forEach(button => {
      // عند الضغط على زر
      button.addEventListener('click', () => {
        // إزالة التحديد من جميع الأزرار في المجموعة
        buttons.forEach(btn => btn.classList.remove('selected'));
        // تحديد الزر الحالي
        button.classList.add('selected');
        // إذا كانت المجموعة خاصة بعدد المواد
        if (group.id === 'courseCount') {
          courseChangeCounter++;
          if (courseChangeCounter >= 4) {
            courseChangeCounter = 0;
            location.reload(); // إعادة تحميل الصفحة بعد 4 تغييرات
          }
          updateCoursesUI(); // تحديث واجهة المواد
        }
      });
    });
  });
}

// دالة لجلب القيمة المحددة من مجموعة أزرار معينة
function getSelectedValue(groupId) {
  const group = document.getElementById(groupId);
  if (!group) return null;
  const selectedButton = group.querySelector('.option-button.selected');
  return selectedButton ? selectedButton.dataset.value : null;
}

// تعريف المتغيرات المرتبطة بعناصر الصفحة الرئيسية (للتعامل مع واجهة المستخدم)
const isFirstSemesterGroup = document.getElementById('isFirstSemester');
const previousDataSection = document.getElementById('previousDataSection');
const courseCountGroup = document.getElementById('courseCount');
const coursesContainer = document.getElementById('coursesContainer');
const calculateButton = document.getElementById('calculateButton');
const resetButton = document.getElementById('resetButton');
const resultSection = document.getElementById('resultSection');


// عند الضغط على اختيار "هل هذا أول فصل؟" يتم إظهار أو إخفاء أقسام البيانات السابقة وحالة الطالب
isFirstSemesterGroup.addEventListener('click', () => {
  const isFirst = getSelectedValue('isFirstSemester') === 'yes';
  previousDataSection.classList.toggle('hidden', isFirst); // إظهار/إخفاء بيانات المعدل السابق
  toggleRepeatedOptions(); // تحديث خيارات الإعادة
});

// مصفوفة لتخزين بيانات المواد
let courses = [];

// دالة تحديث واجهة المواد حسب العدد المختار
function updateCoursesUI() {
  const count = parseInt(getSelectedValue('courseCount')) || 4;
  coursesContainer.innerHTML = '';
  courses = [];

  // إنشاء واجهة لكل مادة
  for (let i = 1; i <= count; i++) {
    const coursesection = document.createElement('section');
    coursesection.classList.add('course');
    // بناء واجهة المادة (اسم، رمز، ساعات، خيارات الإعادة)
    coursesection.innerHTML = `
      <h3>
        <span class="course-name">المادة ${i}</span>
        <input type="text" class="course-name-input hidden" placeholder="أدخل اسم المادة">
      </h3>
      <div class="course-code-section">
        <label>رمز المادة</label>
        <div class="button-group course-code" id="course-code-${i}">
          <button class="option-button selected" data-value="أ">أ</button>
          <button class="option-button" data-value="أ-">أ-</button>
          <button class="option-button" data-value="ب+">ب+</button>
          <button class="option-button" data-value="ب">ب</button>
          <button class="option-button" data-value="ب-">ب-</button>
          <button class="option-button" data-value="ج+">ج+</button>
          <button class="option-button" data-value="ج">ج</button>
        </div>
      </div>
      <label>عدد الساعات</label>
      <div class="button-group course-hours" id="course-hours-${i}">
        <button class="option-button" data-value="2">2</button>
        <button class="option-button selected" data-value="3">3</button>
      </div>
      <section class="repeated-course hidden">
        <label>هل المادة معادة؟</label>
        <div class="button-group course-repeated" id="course-repeated-${i}">
          <button class="option-button selected" data-value="no">لا</button>
          <button class="option-button" data-value="yes">نعم</button>
        </div>
        <section class="old-course hidden">
          <label>رمز المادة القديم للمادة المعادة</label>
          <div class="button-group old-course-code" id="old-course-code-${i}">
            <button class="option-button" data-value="ج+">ج+</button>
            <button class="option-button" data-value="ج">ج</button>
          </div>

        </section>
      </section>
    `;
    coursesContainer.appendChild(coursesection);

    // تعريف المتغيرات الخاصة بكل مادة
    const repeatedsection = coursesection.querySelector('.repeated-course');
    const repeatedGroup = coursesection.querySelector('.course-repeated');
    const oldCoursesection = coursesection.querySelector('.old-course');
    const courseCodeSection = coursesection.querySelector('.course-code-section');
    const oldCourseCodeGroup = coursesection.querySelector('.old-course-code');

    const hoursGroup = coursesection.querySelector('.course-hours');
    // عند تغيير عدد الساعات، إظهار أو إخفاء خيارات الرمز والإعادة
    hoursGroup.addEventListener('click', () => {
      const selectedHours = parseFloat(getSelectedValue(hoursGroup.id));
      if (selectedHours === 0) {
        courseCodeSection.classList.add('hidden');
        repeatedsection.classList.add('hidden');
      } else {
        courseCodeSection.classList.remove('hidden');
        const isFirstSemester = getSelectedValue('isFirstSemester') === 'yes';
        if (!isFirstSemester) {
          repeatedsection.classList.remove('hidden');
        }
      }
    });



    // عند اختيار "معادة"، إظهار أو إخفاء خيارات الرموز القديمة
    repeatedGroup.addEventListener('click', () => {
      if (getSelectedValue(repeatedGroup.id) === 'yes') {
        oldCoursesection.classList.remove('hidden');
      } else {
        oldCoursesection.classList.add('hidden');
        oldCourseCodeGroup.querySelectorAll('.option-button').forEach(btn => {
          btn.classList.remove('selected');
        });
      }
    });

    // إضافة بيانات المادة للمصفوفة
    courses.push({
      name: coursesection.querySelector('.course-name'),
      code: coursesection.querySelector('.course-code'),
      hours: coursesection.querySelector('.course-hours'),
      repeated: repeatedGroup,
      oldCode: coursesection.querySelector('.old-course-code'),
      oldSystemCode: ''
    });
  }

  initializeButtonGroups(); // تهيئة أزرار الخيارات لكل مادة
  toggleRepeatedOptions(); // تحديث خيارات الإعادة حسب الفصل
  enableCourseNameEditing(); // تفعيل تحرير اسم المادة
}

// دالة لإظهار أو إخفاء خيارات الإعادة حسب إذا كان الفصل الأول أم لا
function toggleRepeatedOptions() {
  const isFirstSemester = getSelectedValue('isFirstSemester') === 'yes';
  const repeatedsections = document.querySelectorAll('.repeated-course');

  repeatedsections.forEach(section => {
    if (isFirstSemester) {
      section.classList.add('hidden');
    } else {
      section.classList.remove('hidden');
    }
  });
}

// دالة لإظهار رسالة خطأ للمستخدم (إما بجانب الحقل أو في أعلى الصفحة)
function showError(message, elementId = null) {
  const existingErrors = document.querySelectorAll('.error-message-inline');
  existingErrors.forEach(error => error.remove());

  const errorInputs = document.querySelectorAll('.input-error');
  errorInputs.forEach(input => input.classList.remove('input-error'));

  if (elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      element.classList.add('input-error');

      const errorDiv = document.createElement('div');
      errorDiv.className = 'error-message-inline';
      errorDiv.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${message}</span>
      `;

      element.parentNode.insertBefore(errorDiv, element.nextSibling);

      element.scrollIntoView({ behavior: 'smooth', block: 'center' });

      setTimeout(() => {
        errorDiv.remove();
        element.classList.remove('input-error');
      }, 3000);
    }
  } else {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
      <i class="fas fa-exclamation-circle"></i>
      <span>${message}</span>
    `;

    document.body.appendChild(errorDiv);

    setTimeout(() => {
      errorDiv.remove();
    }, 3000);
  }
}

// دالة حساب المعدل التراكمي والفصلي والمنطق الكامل للحساب
function calculateGPA() {
  const isFirstSemester = getSelectedValue('isFirstSemester') === 'yes';
  let previousGPA = parseFloat(document.getElementById('previousGPA').value) || 0;
  let previousHours = parseFloat(document.getElementById('previousHours').value) || 0;

  // إذا كان أول فصل، تجاهل المعدل والساعات السابقة
  if (isFirstSemester) {
    previousGPA = 0;
    previousHours = 0;
  } else {
    // تحقق من صحة إدخال المعدل التراكمي السابق
    if (isNaN(previousGPA) || previousGPA < 0.0000 || previousGPA > 4.0000 || !/^\d+(\.\d{1,4})?$/.test(previousGPA)) {
      showError('يرجى إدخال معدل تراكمي صحيح', 'previousGPA');
      return;
    }
    // تحقق من صحة إدخال الساعات السابقة
    if (isNaN(previousHours) || previousHours <= 0) {
      showError('يرجى إدخال عدد ساعات صحيح', 'previousHours');
      return;
    }
  }

  // حساب النقاط والساعات
  let totalPoints = previousGPA * previousHours;
  let totalHours = previousHours;
  let semesterPoints = 0;
  let semesterHours = 0;

  const newCourses = [];

  // المرور على كل مادة وإجراء الحسابات
  for (const course of courses) {
    const hours = parseFloat(getSelectedValue(course.hours.id));
    const grade = getSelectedValue(course.code.id);
    const repeated = getSelectedValue(course.repeated.id) === 'yes';
    const oldCode = getSelectedValue(course.oldCode.id);
    const oldSystemCode = getSelectedValue(course.oldSystemCode.id);
    const courseName = course.name.textContent;

    // إذا كانت المادة بدون ساعات (محذوفة)
    if (hours === 0) {
      newCourses.push({
        name: courseName,
        code: grade,
        hours: hours,
        gradeValue: 0,
        oldCode: repeated ? oldCode : '',
        oldSystemCode: repeated ? oldSystemCode : ''
      });
      continue;
    }

    // جلب قيمة الدرجة
    const gradeValue = gradePoints[grade];
    if (gradeValue === undefined) {
      showError('يرجى إدخال رمز مادة صحيح', course.code.id);
      return;
    }

    // معالجة المواد المعادة
    if (repeated) {
      let oldGradeValue;
      if (oldCode) {
        oldGradeValue = gradePoints[oldCode];
      } else if (oldSystemCode) {
        oldGradeValue = gradePoints['old-' + oldSystemCode];
      }

      if (oldGradeValue === undefined) {
        showError('يرجى إدخال رمز مادة قديمة صحيح', course.oldCode.id);
        return;
      }

      if (hours > previousHours) {
        showError('يرجى التأكد من ساعات المادة المعادة', course.hours.id);
        return;
      }

      // إذا كانت المادة معادة بنظام قديم
      if (oldSystemCode) {
        const newPoints = gradeValue * hours;
        const oldPoints = oldGradeValue * hours;
        if (newPoints > oldPoints) {
          totalPoints -= oldPoints;
          totalPoints += newPoints;
        }
        semesterPoints += gradeValue * hours;
        semesterHours += hours;
      } else if (gradeValue > oldGradeValue) {
        totalPoints -= oldGradeValue * hours;
        totalPoints += gradeValue * hours;
        semesterPoints += gradeValue * hours;
        semesterHours += hours;
      }
    } else {
      // مادة عادية
      totalPoints += gradeValue * hours;
      totalHours += hours;
      semesterPoints += gradeValue * hours;
      semesterHours += hours;
    }

    newCourses.push({
      name: courseName,
      code: grade,
      hours: hours,
      gradeValue: gradeValue,
      oldCode: repeated ? oldCode : '',
      oldSystemCode: repeated ? oldSystemCode : ''
    });
  }

  // حساب المعدل التراكمي الجديد والفصلي
  let newGPA = totalPoints / totalHours;
  const semesterGPA = semesterPoints / semesterHours;

  // تحقق من أن المعدل التراكمي لا يتجاوز 4
  if (newGPA > 4) {
    newGPA = 4;
  }



  // حساب المعدل قبل وبعد الجبر (التقريب)
  const gpaBeforeJabr = newGPA.toFixed(4);
  const gpaAfterJabr = roundTo2WithJabr(newGPA);
  const showBeforeJabr = gpaBeforeJabr !== gpaAfterJabr;

  // عرض النتائج
  displayResult(newGPA, totalHours, newCourses, previousGPA, previousHours, semesterGPA, semesterHours);

  setTimeout(() => {
    document.getElementById('resultSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 300);
  resetButton.classList.remove('hidden');
}

// دالة عرض النتائج النهائية في واجهة المستخدم
function displayResult(newGPA, totalHours, newCourses, previousGPA, previousHours, semesterGPA, semesterHours) {
  const isFirstSemester = getSelectedValue('isFirstSemester') === 'yes';
  const gpaCategory = getGPACategory(newGPA);

  const hasRepeatedCourses = newCourses.some(course => course.oldCode !== '' || course.oldSystemCode !== '');

  const gpaBeforeJabr = newGPA.toFixed(4);
  const gpaAfterJabr = roundTo2WithJabr(newGPA);
  const showBeforeJabr = gpaBeforeJabr !== gpaAfterJabr;

  let resultHTML = `
  <h2>نتائج الحساب</h2>
  <table>
    <thead>
      <tr>
        ${showBeforeJabr ? '<th>المعدل قبل الجبر</th>' : ''}
        <th>المعدل التراكمي الجديد</th>
        <th>التقدير</th>
        <th>الساعات التراكمية الجديدة </th>

      </tr>
    </thead>
    <tbody>
      <tr>
        ${showBeforeJabr ? `<td><span class="gpa-value">${gpaBeforeJabr}</span></td>` : ''}
        <td><span class="gpa-value">${gpaAfterJabr}</span></td>
        <td><span class="category">${gpaCategory}</span></td>
        <td>${totalHours}</td>

      </tr>
    </tbody>
  </table>

  <table>
    <thead>
      <tr>
        <th>اسم المادة</th>
        <th>رمز المادة</th>
        ${hasRepeatedCourses ? '<th>رمز المادة المعادة</th>' : ''}
        <th>الساعات</th>
      </tr>
    </thead>
    <tbody>
`;

  let failedCourses = [];
  newCourses.forEach(course => {
    let oldCodeDisplay = '-';
    if (course.oldCode) {
      oldCodeDisplay = course.oldCode;
    } else if (course.oldSystemCode) {
      oldCodeDisplay = course.oldSystemCode;
    } else if (course.hours === 0 || !course.repeated) {
      oldCodeDisplay = '---';
    }

    if (course.hours !== 0 && course.code === 'ج') {
      failedCourses.push({ name: course.name, code: course.code });
    }

    resultHTML += `
    <tr>
      <td>${course.name}</td>
      <td><span class="grade-symbol${(course.hours !== 0 && course.code === 'ج') ? ' grade-symbol--red' : ''}">${course.hours === 0 ? '---' : course.code}</span></td>
      ${hasRepeatedCourses ? `<td><span class="grade-symbol">${course.hours === 0 ? '---' : (course.oldCode || course.oldSystemCode ? (course.oldCode || course.oldSystemCode) : '-')}</span></td>` : ''}
      <td>${course.hours}</td>
    </tr>
    `;
  });

  resultHTML += `
    </tbody>
  </table>
`;

  // إذا كان هناك مواد راسبة، عرضها بشكل خاص
  if (failedCourses.length > 0) {
    resultHTML += `<div style=\"color:#E53935;font-weight:bold;margin-top:10px;\">${failedCourses.length === 1 ? 'هناك مادة لم تحقق الحد الأدنى للنجاح:' : 'هناك مواد لم تحقق الحد الأدنى للنجاح:'}</div>`;
    resultHTML += `<table class=\"failed-courses-table\"><thead><tr><th>اسم المادة</th><th>رمز المادة</th></tr></thead><tbody>`;
    failedCourses.forEach(f => {
      resultHTML += `<tr><td>${f.name}</td><td>${f.code}</td></tr>`;
    });
    resultHTML += '</tbody></table>';
  }

  // عرض المعدل والساعات القديمة إذا لم يكن أول فصل
  if (!isFirstSemester) {
    resultHTML += `
    <table>
      <thead>
        <tr>
          <th>المعدل التراكمي القديم</th>
          <th>الساعات التراكمية القديمة</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>${roundTo2WithJabr(previousGPA)}</td>
          <td>${previousHours}</td>
        </tr>
      </tbody>
    </table>
  `;
  }

  // عرض المعدل الفصلي والساعات الفصلية إذا لم يكن أول فصل
  if (!isFirstSemester) {
    resultHTML += `
    <table>
      <thead>
        <tr>
          <th>المعدل الفصلي</th>
          <th>الساعات الفصلية</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>${semesterGPA.toFixed(4)}</td>
          <td>${semesterHours}</td>
        </tr>
      </tbody>
    </table>
  `;
  }

  // إضافة جدول تحذيري إذا كان المعدل التراكمي أقل من 2.00
  if (parseFloat(gpaAfterJabr) < 2.00) {
    const warningTable = `
      <div style="color:#E53935;font-weight:bold;margin-top:10px;">لم تحقق الحد الأدنى للنجاح في المعدل التراكمي:</div>
      <table class="failed-courses-table">
        <thead><tr><th>المعدل التراكمي الجديد</th><th>الحد الأدنى المطلوب</th></tr></thead>
        <tbody>
          <tr><td style="color:#E53935;font-weight:bold;">${gpaAfterJabr}</td><td>2.00</td></tr>
        </tbody>
      </table>
    `;
    resultHTML += warningTable;
  }

  // دالة لضبط حجم الخط حسب حجم الشاشة
  function adjustForScreenSize() {
    const screenWidth = window.innerWidth;
    const resultSection = document.getElementById('resultSection');

    if (resultSection) {
      if (screenWidth < 600) {
        resultSection.style.fontSize = '8px';
      } else if (screenWidth < 900) {
        resultSection.style.fontSize = '10px';
      } else {
        resultSection.style.fontSize = '12px';
      }
    }
  }

  window.addEventListener('load', adjustForScreenSize);
  window.addEventListener('resize', adjustForScreenSize);

  resultSection.innerHTML = resultHTML;
  resultSection.classList.remove('hidden');
}

// دالة تحديد التقدير النصي حسب المعدل
function getGPACategory(gpa) {
  if (gpa >= 3.65 && gpa <= 4.00) return 'ممتاز';
  if (gpa >= 3.00 && gpa <= 3.64) return 'جيد جداً';
  if (gpa < 3.00) return 'ضعيف';
}

// دالة إعادة تعيين النموذج بالكامل
function resetForm() {
  const isFirstSemesterButton = document.querySelector('#isFirstSemester .option-button[data-value="yes"]');
  isFirstSemesterButton.click();
  previousDataSection.classList.add('hidden');
  document.getElementById('previousGPA').value = '';
  document.getElementById('previousHours').value = '';

  const courseCountButton = document.querySelector('#courseCount .option-button[data-value="4"]');
  courseCountButton.click();

  resultSection.classList.add('hidden');
  resetButton.classList.add('hidden');
}

// دالة تفعيل تحرير اسم المادة عند الضغط عليه
function enableCourseNameEditing() {
  const courseNames = document.querySelectorAll('.course-name');

  courseNames.forEach(courseName => {
    courseName.addEventListener('click', () => {
      const courseNameInput = courseName.nextElementSibling;
      courseName.classList.add('hidden');
      courseNameInput.classList.remove('hidden');
      courseNameInput.focus();

      courseNameInput.addEventListener('blur', () => {
        if (courseNameInput.value.trim() !== '') {
          courseName.textContent = courseNameInput.value;
        }
        courseName.classList.remove('hidden');
        courseNameInput.classList.add('hidden');
      });

      courseNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          if (courseNameInput.value.trim() !== '') {
            courseName.textContent = courseNameInput.value;
          }
          courseName.classList.remove('hidden');
          courseNameInput.classList.add('hidden');
        }
      });
    });
  });
}

// عند تحميل الصفحة: تهيئة كل شيء
// تهيئة السمة، الأزرار، المواد، ربط أزرار الحساب وإعادة التعيين
// عرض نجوم متحركة في الصفحة الرئيسية (تأثير جمالي)
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initializeButtonGroups();
  updateCoursesUI();

  calculateButton.addEventListener('click', calculateGPA);
  resetButton.addEventListener('click', resetForm);

  // نجوم المنطقة الرئيسية بين الهيدر والسؤال الأول (عرض مؤقت فقط)
  const mainStarsRow = document.getElementById('mainStarsRow');
  if (mainStarsRow && mainStarsRow.childElementCount === 0 && mainStarsRow.innerHTML.trim() === '') {
    mainStarsRow.innerHTML = `
      <div class=\"main-stars-row\">
        <div class=\"main-star-block\" id=\"main-star-block-1\">
          <svg class=\"main-star-svg\" viewBox=\"0 0 40 40\"><polygon fill=\"#E53935\" points=\"${setHeptagramPoints(20,20,18,7,7)}\"/></svg>
          <div class="main-star-label" id="main-star-label-1"></div>
        </div>
        <div class=\"main-star-block\" id=\"main-star-block-2\">
          <svg class=\"main-star-svg\" viewBox=\"0 0 40 40\"><polygon fill=\"#E53935\" points=\"${setHeptagramPoints(20,20,18,7,7)}\"/></svg>
          <div class=\"main-star-label\" id=\"main-star-label-2\"></div>
        </div>
        <div class=\"main-star-block\" id=\"main-star-block-3\">
          <svg class=\"main-star-svg\" viewBox=\"0 0 40 40\"><polygon fill=\"#E53935\" points=\"${setHeptagramPoints(20,20,18,7,7)}\"/></svg>
          <div class=\"main-star-label\" id=\"main-star-label-3\"></div>
        </div>
      </div>
    `;
    // دالة تأثير الكتابة
    function typeWriter(element, text, cb) {
      let i = 0;
      element.textContent = '';
      element.classList.remove('typed');
      function typing() {
        if (i < text.length) {
          element.textContent += text.charAt(i);
          i++;
          setTimeout(typing, 60);
        } else {
          element.classList.add('typed');
          if (cb) cb();
        }
      }
      typing();
    }
    // إظهار النجوم والنصوص بالتدريج
    setTimeout(() => {
      document.getElementById('main-star-block-1').classList.add('visible');
      typeWriter(document.getElementById('main-star-label-1'), 'قول', () => {
        setTimeout(() => {
          document.getElementById('main-star-block-2').classList.add('visible');
          typeWriter(document.getElementById('main-star-label-2'), 'فعل', () => {
            setTimeout(() => {
              document.getElementById('main-star-block-3').classList.add('visible');
              typeWriter(document.getElementById('main-star-label-3'), 'إنجاز', () => {
                setTimeout(() => {
                  mainStarsRow.style.display = 'none';
                }, 1000);
              });
            }, 1000);
          });
        }, 1000);
      });
    }, 100);
  }

  injectWarningsFAQ();
  injectGradingSystemFAQ();
});

// دعم الوصولية لزر الهامبرغر بلوحة المفاتيح
const hamburger = document.querySelector('.hamburger');
if (hamburger) {
  hamburger.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      document.getElementById('burgerMenu').click();
      e.preventDefault();
    }
  });
}

// دالة تقريب المعدل حسب نظام الجبر (تقريب لأقرب منزلتين مع جبر)
function roundTo2WithJabr(num) {
  let n = Number(num);
  let multiplied = n * 1000; // حتى الخانة الثالثة
  let thirdDigit = Math.floor(multiplied) % 10;
  if (thirdDigit < 5) {
    return n.toFixed(4);
  } else {
    let base = Math.floor(n * 100) / 100;
    base += 0.01;
    return base.toFixed(4);
  }
}

// رسم نجمة سباعية مثالية داخل SVG
function setHeptagramPoints(cx, cy, rOuter, rInner, numPoints) {
  const points = [];
  const step = Math.PI / numPoints;
  for (let i = 0; i < numPoints * 2; i++) {
    const r = i % 2 === 0 ? rOuter : rInner;
    const angle = (Math.PI / 2) + (i * step * 2 * 7 / numPoints);
    const x = cx + r * Math.cos(angle);
    const y = cy - r * Math.sin(angle);
    points.push(x + ',' + y);
  }
  return points.join(' ');
}

// تفعيل تفاعل قسم الأسئلة الأكثر شيوعاً (FAQ)
document.addEventListener('DOMContentLoaded', function() {
  const faqQuestions = document.querySelectorAll('.faq-question');
  faqQuestions.forEach(btn => {
    btn.addEventListener('click', function() {
      const item = btn.parentElement;
      // إغلاق جميع العناصر الأخرى
      document.querySelectorAll('.faq-item').forEach(faq => {
        if (faq !== item) faq.classList.remove('open');
      });
      // تبديل العنصر الحالي
      item.classList.toggle('open');
    });
  });
});

// منطق القائمة الجانبية (الهامبرغر) كما في gpa

document.addEventListener('DOMContentLoaded', function() {
  const navEl = document.querySelector('.nav');
  const hamburgerLabel = document.querySelector('.hamburger');
  const toggleInput = document.querySelector('.hamburger input');
  const navLinks = document.querySelectorAll('.nav__link, .submenu-link');

  function updateNav(isOpen) {
    navEl.classList.toggle('nav--open', isOpen);
    hamburgerLabel.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  if (toggleInput) {
    toggleInput.addEventListener('change', () => {
      updateNav(toggleInput.checked);
    });
  }

  // أزل الكود الذي يغلق القائمة عند الضغط على أي رابط داخلها
  // navLinks.forEach(link => {
  //   link.addEventListener('click', () => {
  //     if (toggleInput) toggleInput.checked = false;
  //     updateNav(false);
  //   });
  // });

  document.addEventListener('click', e => {
    const isInside = navEl.contains(e.target) || hamburgerLabel.contains(e.target);
    if (!isInside && toggleInput && toggleInput.checked) {
      toggleInput.checked = false;
      updateNav(false);
    }
  });

  updateNav(false);

  // القائمة الفرعية (حساب المعدل)
  const submenuParent = document.querySelector('.has-submenu');
  const submenuList = submenuParent ? submenuParent.querySelector('.submenu-list') : null;
  if (submenuParent && submenuList) {
    submenuParent.querySelector('.nav__link').addEventListener('click', function(e) {
      e.preventDefault();
      submenuList.classList.toggle('hidden');
      submenuParent.classList.toggle('open');
    });
  }

  // التحويل بين الوضع الليلي والنهاري عند الضغط على Alt
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Alt') {
      e.preventDefault(); // منع السلوك الافتراضي لمفتاح Alt
      const themeToggle = document.getElementById('themeToggle');
      if (themeToggle) {
        themeToggle.checked = !themeToggle.checked;
        const currentTheme = themeToggle.checked ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', currentTheme);
        localStorage.setItem('theme', currentTheme);
      }
    }
  });
});

// --- نجمة سباعية تتبع الماوس مع التذيل ---
(function() {
  // فحص شامل للأجهزة اللمسية
  if ('ontouchstart' in window || 
      navigator.maxTouchPoints > 0 || 
      navigator.msMaxTouchPoints > 0 ||
      window.matchMedia && window.matchMedia('(pointer: coarse)').matches ||
      window.matchMedia && window.matchMedia('(hover: none)').matches) {
    return;
  }

  function starPolygonSVG(color, size) {
    const cx = size/2, cy = size/2, rOuter = size/2-2, rInner = 7, numPoints = 7;
    const points = setHeptagramPoints(cx, cy, rOuter, rInner, numPoints);
    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none"><polygon fill="${color}" points="${points}"/></svg>`;
  }

  const star = document.createElement('div');
  star.className = 'star-cursor';
  star.innerHTML = starPolygonSVG('#E53935', 48) + `<div class="star-cursor-inner"></div>`;
  document.body.appendChild(star);
  const starInner = star.querySelector('.star-cursor-inner');
  starInner.innerHTML = starPolygonSVG('#fff', 36);

  // متغيرات للتذيل
  let trailPositions = [];
  const maxTrails = 8;
  let lastMoveTime = 0;
  const trailInterval = 80; // إنشاء تذيل كل 80 مللي ثانية

  function createTrail(x, y) {
    const trail = document.createElement('div');
    trail.className = 'star-cursor-trail';
    trail.style.left = x + 'px';
    trail.style.top = y + 'px';
    trail.innerHTML = starPolygonSVG('#E53935', 48);
    document.body.appendChild(trail);

    // إزالة التذيل بعد انتهاء الأنيميشن
    setTimeout(() => {
      if (trail.parentNode) {
        trail.parentNode.removeChild(trail);
      }
    }, 1200);
  }

  function moveStar(e) {
    const currentX = e.clientX;
    const currentY = e.clientY;
    const currentTime = Date.now();

    star.style.left = currentX + 'px';
    star.style.top = currentY + 'px';

    // إنشاء التذيل كل فترة زمنية محددة
    if (currentTime - lastMoveTime > trailInterval) {
      createTrail(currentX, currentY);
      lastMoveTime = currentTime;
    }
  }

  function setHovering(on) {
    if (on) star.classList.add('hovering');
    else star.classList.remove('hovering');
  }

  document.addEventListener('mousemove', moveStar);

  const hoverSelectors = ['button', '.option-button', '.faq-question'];
  hoverSelectors.forEach(sel => {
    document.addEventListener('mouseover', e => {
      if (e.target.closest(sel)) setHovering(true);
    });
    document.addEventListener('mouseout', e => {
      if (e.target.closest(sel)) setHovering(false);
    });
  });
})();

// --- نجمة الضغط للشاشات اللمسية ---
(function() {
  // فحص شامل للأجهزة اللمسية
  const isTouchDevice = 'ontouchstart' in window || 
                       navigator.maxTouchPoints > 0 || 
                       navigator.msMaxTouchPoints > 0 ||
                       (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) ||
                       (window.matchMedia && window.matchMedia('(hover: none)').matches);
  
  if (!isTouchDevice) return;
  
  console.log('Touch star feature enabled');

  // دالة إنشاء نجمة SVG مطابقة لنجمة التتبع تماماً
  function starPolygonSVG(color, size) {
    const cx = size/2, cy = size/2, rOuter = size/2-2, rInner = 7, numPoints = 7;
    const points = setHeptagramPoints(cx, cy, rOuter, rInner, numPoints);
    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none"><polygon fill="${color}" points="${points}"/></svg>`;
  }

  function createTouchStar(x, y) {
    console.log('Creating touch star at:', x, y);
    const touchStar = document.createElement('div');
    touchStar.className = 'touch-star';
    touchStar.style.left = x + 'px';
    touchStar.style.top = y + 'px';
    
    // النجمة البيضاء مع الدائرة الحمراء (مطابقة لنجوم الموقع)
    const innerStar = document.createElement('div');
    innerStar.className = 'touch-star-inner';
    // استخدام نفس معاملات نجوم الموقع: setHeptagramPoints(20,20,18,7,7) مع viewBox="0 0 40 40"
    const points = setHeptagramPoints(20, 20, 18, 7, 7);
    innerStar.innerHTML = `<svg width="20" height="20" viewBox="0 0 40 40" fill="none"><polygon fill="#FFFFFF" points="${points}"/></svg>`;
    
    touchStar.appendChild(innerStar);
    document.body.appendChild(touchStar);

    // إزالة النجمة بعد انتهاء الأنيميشن
    setTimeout(() => {
      if (touchStar.parentNode) {
        touchStar.parentNode.removeChild(touchStar);
      }
    }, 600);
  }

  // إضافة مستمع واحد فقط للضغط
  document.addEventListener('pointerdown', function(e) {
    if (e.pointerType === 'touch') {
      console.log('Touch event detected');
      createTouchStar(e.clientX, e.clientY);
    }
  });
})();

// حقن سؤال مراحل الإنذارات والفصل الأكاديمي ديناميكياً
function injectWarningsFAQ() {
  const warningsSection = document.getElementById('warnings-faq-section');
  if (!warningsSection) return;
  warningsSection.innerHTML = `
    <button class="faq-question"><span>ما هي مراحل الإنذارات والفصل الأكاديمي في الجامعة الأردنية</span></button>
    <div class="faq-answer">
      <div class="warnings-tree-root">
        <div class="warnings-tree-flex-center">
          <div class="warnings-tree-node warning-stage-red warnings-tree-node-red">
            <div class="warnings-tree-node-title">عند حصولك على معدل دون 2.0</div>
            <div class="warnings-tree-node-subtitle">تعطى إنذار أول</div>
            <div class="tree-label-inside">نهاية الفصل 1</div>
          </div>
        </div>
        <div class="warnings-tree-arrow-down">
          <span class="warnings-tree-arrow-icon">&#8595;</span>
        </div>
        <div class="warnings-tree-node warning-stage-red warnings-tree-node-red">
          <div class="warnings-tree-node-title">إذا استمر معدلك دون 2.0</div>
          <div class="warnings-tree-node-subtitle">تعطى إنذار نهائي</div>
          <div class="tree-label-inside">نهاية الفصل 2</div>
        </div>
        <div class="warnings-tree-arrow-down">
          <span class="warnings-tree-arrow-icon">&#8595;</span>
        </div>
        <div class="warnings-tree-svg-container-50">
          <svg width="100%" height="50" viewBox="0 0 100 50" preserveAspectRatio="none" class="warnings-tree-svg-absolute">
            <path d="M50,0 C50,25 25,25 25,50" stroke="#007B3A" stroke-width="3.5" fill="none"/>
            <path d="M50,0 C50,25 75,25 75,50" stroke="#007B3A" stroke-width="3.5" fill="none"/>
          </svg>
        </div>
        <div class="warnings-tree-branch-row warnings-tree-branch-row-custom">
          <div class="warnings-tree-branch">
            <div class="warnings-tree-node condition-node">
              <div class="warnings-tree-condition">معدلك أكبر أو يساوي 1.95 أو أتممت 99 ساعة بنجاح</div>
              <div class="warnings-tree-result">تبقى تحت الإنذار النهائي</div>
              <div class="warnings-tree-stage stage-green">نهاية الفصل 3</div>
            </div>
          </div>
          <div class="warnings-tree-branch">
            <div class="warnings-tree-node condition-node">
              <div class="warnings-tree-condition">إذا حصلت على معدل أقل من 1.95</div>
              <div class="warnings-tree-result">تفصل دراسة خاصة لمدة فصل واحد</div>
              <div class="warnings-tree-stage stage-green">نهاية الفصل 3</div>
            </div>
            <div class="warnings-tree-svg-container-50">
              <svg width="100%" height="50" viewBox="0 0 100 50" preserveAspectRatio="none" class="warnings-tree-svg-absolute">
                <path d="M50,0 C50,25 25,25 25,50" stroke="#007B3A" stroke-width="3.5" fill="none"/>
                <path d="M50,0 C50,25 75,25 75,50" stroke="#007B3A" stroke-width="3.5" fill="none"/>
              </svg>
            </div>
            <div class="warnings-tree-branch-row warnings-tree-branch-row-custom">
              <div class="warnings-tree-branch">
                <div class="warnings-tree-node condition-node">
                  <div class="warnings-tree-condition">إذا حصلت على معدل أكبر من أو يساوي 1.75</div>
                  <div class="warnings-tree-result">تعطى فصل دراسة خاصة ثاني</div>
                  <div class="warnings-tree-stage stage-green">نهاية الفصل 4</div>
                </div>
                <div class="warnings-tree-svg-container-50">
                  <svg width="100%" height="50" viewBox="0 0 100 50" preserveAspectRatio="none" class="warnings-tree-svg-absolute">
                    <path d="M50,0 C50,25 25,25 25,50" stroke="#007B3A" stroke-width="3.5" fill="none"/>
                    <path d="M50,0 C50,25 75,25 75,50" stroke="#007B3A" stroke-width="3.5" fill="none"/>
                  </svg>
                </div>
                <div class="warnings-tree-branch-row warnings-tree-branch-row-custom">
                  <div class="warnings-tree-branch">
                    <div class="warnings-tree-node condition-node">
                      <div class="warnings-tree-condition">إذا حصلت على معدل أكبر من أو يساوي 1.90</div>
                      <div class="warnings-tree-result">تعطى فصل دراسة خاصة ثالث</div>
                      <div class="warnings-tree-stage stage-green">نهاية الفصل 5</div>
                    </div>
                    <div class="warnings-tree-svg-container-40">
                      <svg width="100%" height="40" viewBox="0 0 100 40" preserveAspectRatio="none" class="warnings-tree-svg-absolute">
                        <path d="M50,0 C50,20 50,20 50,40" stroke="#007B3A" stroke-width="3.5" fill="none"/>
                      </svg>
                    </div>
                    <div class="warnings-tree-node condition-node">
                      <div class="warnings-tree-condition">إذا لم تحصل على معدل 2.0</div>
                      <div class="warnings-tree-result">تفصل نهائيًا من الجامعة</div>
                      <div class="warnings-tree-stage stage-green">نهاية الفصل 6</div>
                    </div>
                  </div>
                  <div class="warnings-tree-branch vertical-children">
                    <div class="warnings-tree-node condition-node">
                      <div class="warnings-tree-condition">إذا حصلت على معدل أقل من 1.90</div>
                      <div class="warnings-tree-result">تفصل نهائيًا من الجامعة</div>
                      <div class="warnings-tree-stage stage-green">نهاية الفصل 5</div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="warnings-tree-branch">
                <div class="warnings-tree-node condition-node">
                  <div class="warnings-tree-condition">إذا حصلت على معدل أقل من 1.75</div>
                  <div class="warnings-tree-result">تفصل نهائيًا من الجامعة</div>
                  <div class="warnings-tree-stage stage-green">نهاية الفصل 4</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="important-notes important-notes-custom">
        <h3 class="important-notes-title-custom">ملاحظات هامة يجب أن تعلمها</h3>
        <ul class="important-notes-ul-custom">
          <li class="important-notes-li-custom">
            <strong class="important-notes-strong-green">•</strong> في أي مرحلة من المراحل المذكورة سابقاً إذا ارتفع معدلك التراكمي فوق <strong class="important-notes-strong-red">(2.00)</strong> نقطة تُلغى جميع الإنذارات عنك أو تعود إلى الدراسة المنتظمة.
          </li>
          <li class="important-notes-li-custom">
            <strong class="important-notes-strong-green">•</strong> في أي فصل من الفصول الدراسية إذا انخفض معدلك التراكمي دون <strong class="important-notes-strong-red">(1.00)</strong> نقطة تفصل من التخصص (باستثناء فصل قبولك في الجامعة أو في الفصل الصيفي)، وعليك تحويل تخصصك إلى تخصص آخر وإذا كنت قد حولت تخصصك سابقاً تفصل نهائياً من الجامعة.
          </li>
          <li class="important-notes-li-custom">
            <strong class="important-notes-strong-green">•</strong> في الفصل الصيفي لا تُعطى أي إنذارات أكاديمية.
          </li>
          <li class="important-notes-li-custom">
            <strong class="important-notes-strong-green">•</strong> هل تعرف ماذا يعني فصلك إلى الدراسة الخاصة:
            <ul class="important-notes-sub-ul">
              <li class="important-notes-sub-li">يعني إيقاف تسجيلك لحين إحضار ولي أمرك وتوقيع تعهد وإقرار عند مسجل كليتك يبين فيه وضعك الأكاديمي.</li>
              <li class="important-notes-sub-li">يعني مضاعفة رسومك الجامعية، أما الطالب المقبول ضمن البرنامج الموازي لا تتضاعف رسومه الجامعية ولكنه يخضع لمراحل الدراسة الخاصة.</li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  `;
}

function injectGradingSystemFAQ() {
  const gradingSection = document.getElementById('grading-system-faq-section');
  if (!gradingSection) return;
  gradingSection.innerHTML = `
    <button class="faq-question"><span>ما هو نظام العلامات والتقدير في الجامعة الأردنية؟</span></button>
    <div class="faq-answer">
      <p>يعتمد نظام العلامات والتقدير في الجامعة الأردنية على الرموز والنقاط والتقديرات التالية:</p>
      <h4 style="margin-bottom:8px; color:#007B3A;">جدول الرموز والنقاط:</h4>
      <table class="example-table small-table">
        <thead>
          <tr>
            <th>العلامة</th>
            <th>النقاط</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>أ</td><td>4</td></tr>
          <tr><td>أ-</td><td>3.75</td></tr>
          <tr><td>ب+</td><td>3.5</td></tr>
          <tr><td>ب</td><td>3</td></tr>
          <tr><td>ب-</td><td>2.75</td></tr>
          <tr><td>ج+</td><td>2.5</td></tr>
          <tr><td>ج</td><td>2</td></tr>
        </tbody>
      </table>
      <h4 style="margin:18px 0 8px 0; color:#007B3A;">جدول التقديرات:</h4>
      <table class="example-table small-table">
        <thead>
          <tr>
            <th>المعدل التراكمي</th>
            <th>التقدير</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>3.65 – 4</td><td>ممتاز</td></tr>
          <tr><td>3.00 – 3.64</td><td>جيد جداً</td></tr>
          <tr><td>دون 3.00</td><td>ضعيف</td></tr>
        </tbody>
      </table>
    </div>
  `;
}

// تفاعل القائمة الفرعية لحساب المعدل
const gpaMenuToggle = document.getElementById('gpaMenuToggle');
const gpaSubList = document.getElementById('gpaSubList');
if (gpaMenuToggle && gpaSubList) {
  gpaMenuToggle.addEventListener('click', function(e) {
    e.preventDefault();
    const isOpen = !gpaSubList.classList.contains('hidden');
    gpaSubList.classList.toggle('hidden');
    gpaMenuToggle.setAttribute('aria-expanded', String(!isOpen));
  });
  // إغلاق القائمة الفرعية عند اختيار عنصر فرعي فقط
  gpaSubList.querySelectorAll('a').forEach(function(link) {
    link.addEventListener('click', function() {
      gpaSubList.classList.add('hidden');
      gpaMenuToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

