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
  'د': 1.00
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
const studentStatusSection = document.getElementById('studentStatusSection');
const studentStatusGroup = document.getElementById('studentStatus');
const semesterTypeGroup = document.getElementById('semesterType');
// const isFirstMajorGroup = document.getElementById('isFirstMajor'); // حذف هذا السطر

// عند الضغط على اختيار "هل هذا أول فصل؟" يتم إظهار أو إخفاء أقسام البيانات السابقة وحالة الطالب
isFirstSemesterGroup.addEventListener('click', () => {
  const isFirst = getSelectedValue('isFirstSemester') === 'yes';
  previousDataSection.classList.toggle('hidden', isFirst); // إظهار/إخفاء بيانات المعدل السابق
  studentStatusSection.classList.toggle('hidden', isFirst); // إظهار/إخفاء حالة الطالب
  toggleRepeatedOptions(); // تحديث خيارات الإعادة
});

// مصفوفة لتخزين بيانات المواد
let courses = [];

// دالة تحديث واجهة المواد حسب العدد المختار
function updateCoursesUI() {
  let count = parseInt(getSelectedValue('courseCount')) || 4;
  if (count < 1) count = 1;
  if (count > 4) count = 4;
  coursesContainer.innerHTML = '';
  courses = [];

  // إنشاء واجهة لكل مادة
  for (let i = 1; i <= count; i++) {
    const coursesection = document.createElement('section');
    coursesection.classList.add('course');
    // بناء واجهة المادة (اسم، رمز، خيارات الإعادة فقط)
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
          <button class="option-button" data-value="ج-">ج-</button>
          <button class="option-button" data-value="د+">د+</button>
        </div>
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
            <button class="option-button" data-value="ب-">ب-</button>
            <button class="option-button" data-value="ج+">ج+</button>
            <button class="option-button" data-value="ج">ج</button>
            <button class="option-button" data-value="ج-">ج-</button>
            <button class="option-button" data-value="د+">د+</button>
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

    // إضافة بيانات المادة للمصفوفة
    courses.push({
      name: coursesection.querySelector('.course-name'),
      code: coursesection.querySelector('.course-code'),
      hours: { id: null }, // لن يتم استخدام id
      repeated: repeatedGroup,
      oldCode: coursesection.querySelector('.old-course-code'),
      oldSystemCode: null // لم يعد هناك نظام قديم
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
    if (isNaN(previousGPA) || previousGPA < 0.0000 || previousGPA > 4.0000 || !/^[0-4](\.\d{1,4})?$/.test(previousGPA)) {
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
  let semesterHoursWithoutRepeated = 0;

  const newCourses = [];
  let repeatedCoursesCount = 0;

  // المرور على كل مادة وإجراء الحسابات
  let replacedOldRepeatedHours = 0;
  for (const course of courses) {
    const hours = 3;
    const grade = getSelectedValue(course.code.id);
    // debug
    console.log('رمز المادة:', grade);
    const gradeValue = gradePoints[grade];
    console.log('قيمة الرمز:', gradeValue);
    const repeated = getSelectedValue(course.repeated.id) === 'yes';
    const oldCode = getSelectedValue(course.oldCode.id);
    const courseName = course.name.textContent;

    // إذا كانت المادة بدون ساعات (محذوفة)
    if (hours === 0) {
      newCourses.push({
        name: courseName,
        code: grade,
        hours: hours,
        gradeValue: 0,
        oldCode: repeated ? oldCode : '',
        oldSystemCode: repeated ? oldCode : '' // لم يعد هناك نظام قديم
      });
      continue;
    }

    // جلب قيمة الدرجة
    if (gradeValue === undefined) {
      showError('يرجى إدخال رمز مادة صحيح', course.code.id);
      return;
    }
    // لا تظهر أي رسالة خطأ لأي رمز من الرموز المسموحة (ج، ج-، د+، د)
    // فقط تأكد أن أقل علامة مسموحة هي د (1.00)
    if (gradeValue < 1.00) {
      showError('أقل علامة مسموحة في الدبلوم المهني هي د (1.00)', course.code.id);
      return;
    }

    // النجاح في المادة من ج (2.00) فأعلى
    const isPassed = gradeValue >= 2.00;

    // معالجة المواد المعادة (يسمح فقط بإعادة مادتين طوال مدة الدراسة)
    if (repeated) {
      repeatedCoursesCount++;
      if (repeatedCoursesCount > 2) {
        showError('يسمح فقط بإعادة مادتين طوال مدة الدبلوم المهني!', course.repeated.id);
        return;
      }
      // عند الإعادة: اطرح نقاط المادة القديمة من النقاط السابقة
      let oldGradeValue = gradePoints[oldCode];
      if (oldGradeValue === undefined) oldGradeValue = 0;
      totalPoints -= oldGradeValue * hours;
      // أضف نقاط المادة الجديدة
      totalPoints += gradeValue * hours;
      // أضف ساعات المادة الجديدة فقط إلى semesterHours و NOT semesterHoursWithoutRepeated
      semesterPoints += gradeValue * hours;
      semesterHours += hours;
      // لا تضف ساعات المادة المعادة إلى semesterHoursWithoutRepeated
    } else {
      // مادة عادية
      totalPoints += gradeValue * hours;
      totalHours += hours;
      semesterPoints += gradeValue * hours;
      semesterHours += hours;
      semesterHoursWithoutRepeated += hours;
    }

    newCourses.push({
      name: courseName,
      code: grade,
      hours: hours,
      gradeValue: gradeValue,
      oldCode: repeated ? oldCode : '',
      oldSystemCode: repeated ? oldCode : '',
      isPassed: isPassed
    });
  }
  // بعد المرور على جميع المواد المعادة، اطرح ساعات المواد المعادة من الساعات السابقة (مرة واحدة فقط)
  totalHours = previousHours + semesterHoursWithoutRepeated;

  // حساب المعدل التراكمي الجديد والفصلي
  let newGPA = totalPoints / totalHours;
  const semesterGPA = semesterPoints / semesterHours;

  // تحقق من أن المعدل التراكمي لا يتجاوز 4
  if (newGPA > 4) {
    newGPA = 4;
  }

  // منطق الإنذار والفصل حسب تعليمات الدبلوم المهني
  let finalStatus = '';
  let warningsCount = 0;
  // استرجاع عدد الإنذارات السابقة من localStorage أو من واجهة المستخدم إذا أردت
  if (!isFirstSemester) {
    warningsCount = parseInt(localStorage.getItem('warningsCount') || '0');
  }
  // تعريف currentStatus بشكل صحيح
  let currentStatus = getSelectedValue('studentStatus');
  let semesterType = getSelectedValue('semesterType');
  if (semesterType === 'صيفي') {
    if (newGPA >= 2.5) {
      finalStatus = 'منتظم';
    } else {
      finalStatus = currentStatus;
    }
  } else if (newGPA <= 1.0) {
    finalStatus = 'فصل من البرنامج';
  } else if (newGPA >= 2.5) {
    finalStatus = 'منتظم';
  } else {
    if (currentStatus === 'منتظم') {
      finalStatus = 'إنذار';
    } else if (currentStatus === 'إنذار') {
      if (newGPA < 2.5) {
        finalStatus = 'إنذار مهلة 1';
      } else {
        finalStatus = 'منتظم';
      }
    } else if (currentStatus === 'إنذار مهلة 1') {
      if (newGPA < 2.5) {
        finalStatus = 'إنذار مهلة 2';
      } else {
        finalStatus = 'منتظم';
      }
    } else if (currentStatus === 'إنذار مهلة 2') {
      if (newGPA <= 2.44) {
        finalStatus = 'فصل من البرنامج';
      } else if (newGPA > 2.44 && newGPA < 2.5) {
        finalStatus = 'إنذار مهلة 2';
      } else {
        finalStatus = 'منتظم';
      }
    } else {
      finalStatus = 'إنذار';
    }
  }

  // حفظ عدد الإنذارات في التخزين المحلي
  if (!isFirstSemester && finalStatus !== 'فصل نهائي من البرنامج') {
    localStorage.setItem('warningsCount', warningsCount.toString());
  } else if (finalStatus === 'دراسة منتظمة' || finalStatus === 'فصل نهائي من البرنامج') {
    localStorage.setItem('warningsCount', '0');
  }

  // حساب المعدل قبل وبعد الجبر (التقريب)
  const gpaBeforeJabr = newGPA.toFixed(4);
  const gpaAfterJabr = roundTo2WithJabr(newGPA);
  const showBeforeJabr = gpaBeforeJabr !== gpaAfterJabr;

  // عرض النتائج
  displayResult(newGPA, totalHours, newCourses, previousGPA, previousHours, semesterGPA, semesterHours, finalStatus);

  setTimeout(() => {
    document.getElementById('resultSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 300);
  resetButton.classList.remove('hidden');
}

// دالة عرض النتائج النهائية في واجهة المستخدم
function displayResult(newGPA, totalHours, newCourses, previousGPA, previousHours, semesterGPA, semesterHours, finalStatus) {
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
        <th>وضع الطالب</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        ${showBeforeJabr ? `<td><span class="gpa-value">${gpaBeforeJabr}</span></td>` : ''}
        <td><span class="gpa-value">${gpaAfterJabr}</span></td>
        <td><span class="grade-category">${gpaCategory}</span></td>
        <td>${totalHours}</td>
        <td><span class="category">${finalStatus}</span></td>
      </tr>
    </tbody>
  </table>

  <table>
    <thead>
      <tr>
        <th>اسم المادة</th>
        <th>رمز المادة</th>
        <th>النقاط</th>
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

    if (course.hours !== 0 && (course.code === 'د-' || course.code === 'هـ')) {
      failedCourses.push({ name: course.name, code: course.code });
    }

    resultHTML += `
    <tr>
      <td>${course.name}</td>
      <td><span class="grade-symbol${(course.hours !== 0 && (course.code === 'د-' || course.code === 'هـ')) ? ' grade-symbol--red' : ''}">${course.hours === 0 ? '---' : course.code}</span></td>
      <td><span class="grade-points">${course.hours === 0 ? '---' : gradePoints[course.code] || '---'}</span></td>
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

  // جمع المواد التي لم تحقق النجاح (ج-، د+، د فقط)
  const failedCoursesByGrade = newCourses.filter(course => ['ج-', 'د+', 'د'].includes(course.code) && course.hours !== 0);
  if (failedCoursesByGrade.length > 0) {
    const failText = failedCoursesByGrade.length === 1 ? 'هناك مادة لم تحقق الحد الأدنى للنجاح' : 'هناك مواد لم تحقق الحد الأدنى للنجاح';
    resultHTML += `<div style='color:#E53935;font-weight:bold;margin-top:10px;'>${failText}</div>`;
    resultHTML += `<table style='width:100%; background:#fff; color:#E53935; font-weight:bold; text-align:center; border:2px solid #E53935; border-radius:10px; margin:10px 0 20px 0;'>`;
    resultHTML += `<thead><tr style='background:#E53935; color:#fff;'><th style='padding:8px;'>رمز النجاح (ج)</th><th style='padding:8px;'>الرمز الذي تم الحصول عليه</th></tr></thead><tbody>`;
    failedCoursesByGrade.forEach(course => {
      resultHTML += `<tr><td style='padding:8px;'>ج</td><td style='padding:8px;'>${course.code}</td></tr>`;
    });
    resultHTML += `</tbody></table>`;
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

  // إضافة جدول تحذيري إذا كان المعدل التراكمي أقل من 2.5
  if (parseFloat(gpaAfterJabr) < 2.5) {
    const warningTable = `
      <div style="color:#E53935;font-weight:bold;margin-top:10px;">لم تحقق الحد الأدنى للنجاح في المعدل التراكمي:</div>
      <div style="border:2px solid #E53935; border-radius:10px; margin:10px 0 20px 0; overflow:hidden;">
        <table style="width:100%; background:#00994C; color:#fff; font-weight:bold; text-align:center; border-radius:10px;">
          <thead>
            <tr style='background:#00994C;'>
              <th style="padding:10px; border-left:1px solid #fff;">المعدل التراكمي الجديد</th>
              <th style="padding:10px;">الحد الأدنى المطلوب</th>
            </tr>
          </thead>
          <tbody>
            <tr style='background:#fff; color:#00994C; font-weight:bold;'>
              <td style="padding:10px; border-left:1px solid #00994C;">${gpaAfterJabr}</td>
              <td style="padding:10px;">2.5</td>
            </tr>
          </tbody>
        </table>
      </div>
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
  if (gpa >= 3.00 && gpa <= 3.64) return 'جيد جدًا';
  if (gpa >= 2.50 && gpa <= 2.99) return 'جيد';
  if (gpa < 2.50) return 'ضعيف';
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
          <svg class=\"main-star-svg\" viewBox=\"0 0 40 40\"><polygon fill=\"#E53935\" points=\"${setHeptagramPoints(20, 20, 18, 7, 7)}\"/></svg>
          <div class="main-star-label" id="main-star-label-1"></div>
        </div>
        <div class=\"main-star-block\" id=\"main-star-block-2\">
          <svg class=\"main-star-svg\" viewBox=\"0 0 40 40\"><polygon fill=\"#E53935\" points=\"${setHeptagramPoints(20, 20, 18, 7, 7)}\"/></svg>
          <div class=\"main-star-label\" id=\"main-star-label-2\"></div>
        </div>
        <div class=\"main-star-block\" id=\"main-star-block-3\">
          <svg class=\"main-star-svg\" viewBox=\"0 0 40 40\"><polygon fill=\"#E53935\" points=\"${setHeptagramPoints(20, 20, 18, 7, 7)}\"/></svg>
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
  hamburger.addEventListener('keydown', function (e) {
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
document.addEventListener('DOMContentLoaded', function () {
  const faqQuestions = document.querySelectorAll('.faq-question');
  faqQuestions.forEach(btn => {
    btn.addEventListener('click', function () {
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

document.addEventListener('DOMContentLoaded', function () {
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
    submenuParent.querySelector('.nav__link').addEventListener('click', function (e) {
      e.preventDefault();
      submenuList.classList.toggle('hidden');
      submenuParent.classList.toggle('open');
    });
  }

  // التحويل بين الوضع الليلي والنهاري عند الضغط على Alt
  document.addEventListener('keydown', function (e) {
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
(function () {
  // فحص شامل للأجهزة اللمسية
  if ('ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0 ||
    window.matchMedia && window.matchMedia('(pointer: coarse)').matches ||
    window.matchMedia && window.matchMedia('(hover: none)').matches) {
    return;
  }

  function starPolygonSVG(color, size) {
    const cx = size / 2, cy = size / 2, rOuter = size / 2 - 2, rInner = 7, numPoints = 7;
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
(function () {
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
    const cx = size / 2, cy = size / 2, rOuter = size / 2 - 2, rInner = 7, numPoints = 7;
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
  document.addEventListener('pointerdown', function (e) {
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
            <div class="warnings-tree-node-title">عند حصولك على معدل دون 2.5</div>
            <div class="warnings-tree-node-subtitle">تعطى إنذار أول</div>
          </div>
        </div>
        <div class="warnings-tree-arrow-down">
          <span class="warnings-tree-arrow-icon">&#8595;</span>
        </div>
        <div class="warnings-tree-node warning-stage-red warnings-tree-node-red">
          <div class="warnings-tree-node-title">إذا استمر معدلك دون 2.5</div>
          <div class="warnings-tree-node-subtitle">إنذار مهلة 1</div>
        </div>
        <div class="warnings-tree-node warning-stage-red warnings-tree-node-red">
          <div class="warnings-tree-node-title">إذا استمر معدلك دون 2.5</div>
          <div class="warnings-tree-node-subtitle">إنذار مهلة 2</div>
        </div>
        <div class="warnings-tree-arrow-down">
          <span class="warnings-tree-arrow-icon">&#8595;</span>
        </div>
        <div class="warnings-tree-branch-row warnings-tree-branch-row-custom">
          <div class="warnings-tree-branch">
            <div class="warnings-tree-node condition-node">
              <div class="warnings-tree-condition">إذا حصلت على معدل 2.45</div>
              <div class="warnings-tree-result">تبقى انذار مهلة 2</div>
            </div>
          </div>
                      <div class="warnings-tree-branch">
              <div class="warnings-tree-node condition-node">
                <div class="warnings-tree-condition">اذا حصلت على معدل 2.44</div>
                <div class="warnings-tree-result">تفصل من البرنامج</div>
              </div>
            </div>
        </div>
      </div>
      <div class="important-notes important-notes-custom">
        <h3 class="important-notes-title-custom">ملاحظات هامة يجب أن تعلمها</h3>
        <ul class="important-notes-ul-custom">
          <li class="important-notes-li-custom">
            <strong class="important-notes-strong-green">•</strong> في أي مرحلة من المراحل المذكورة سابقاً إذا ارتفع معدلك التراكمي فوق <strong class="important-notes-strong-red">(2.50)</strong> نقطة تُلغى جميع الإنذارات عنك أو تعود إلى الدراسة المنتظمة.
          </li>
          <li class="important-notes-li-custom">
            <strong class="important-notes-strong-green">•</strong> في أي فصل من الفصول الدراسية إذا انخفض معدلك التراكمي دون <strong class="important-notes-strong-red">(1.00)</strong> نقطة تفصل من البرنامج باستثناء الفصل الصيفي.
          </li>
          <li class="important-notes-li-custom">
            <strong class="important-notes-strong-green">•</strong> في الفصل الصيفي لا تُعطى أي إنذارات.
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
    <button class="faq-question"><span>ما هو نظام العلامات في الجامعة الأردنية؟</span></button>
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
          <tr><td>ج-</td><td>1.75</td></tr>
          <tr><td>د+</td><td>1.5</td></tr>
        </tbody>
      </table>
      <h4 style="margin:16px 0 8px 0; color:#007B3A;">جدول التقديرات:</h4>
      <table class="example-table small-table">
        <thead>
          <tr>
            <th>التقدير</th>
            <th>النقاط</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>ممتاز</td><td>3.65-4.00</td></tr>
          <tr><td>جيد جدًا</td><td>3.00-3.64</td></tr>
          <tr><td>جيد</td><td>2.50-2.99</td></tr>
          <tr><td>ضعيف</td><td>أقل من 2.50</td></tr>
        </tbody>
      </table>
    </div>
  `;
}

// تفاعل القائمة الفرعية لحساب المعدل
const gpaMenuToggle = document.getElementById('gpaMenuToggle');
const gpaSubList = document.getElementById('gpaSubList');
if (gpaMenuToggle && gpaSubList) {
  gpaMenuToggle.addEventListener('click', function (e) {
    e.preventDefault();
    const isOpen = !gpaSubList.classList.contains('hidden');
    gpaSubList.classList.toggle('hidden');
    gpaMenuToggle.setAttribute('aria-expanded', String(!isOpen));
  });
  // إغلاق القائمة الفرعية عند اختيار عنصر فرعي فقط
  gpaSubList.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      gpaSubList.classList.add('hidden');
      gpaMenuToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

