# Ghana Medical NLP Test Cases

## Test Case 1: Malaria

```
Patient presents with fever, chills, headache, and joint pains for the last 3 days. Has also experienced sweating at night. Patient reports sleeping without mosquito net. Currently has temperature of 38.7°C and complains of weakness.
```

## Test Case 2: Tuberculosis

```
Patient has persistent cough for over 3 weeks with blood-streaked sputum. Reports significant weight loss (5kg in past month), night sweats, and fatigue. Lives in crowded housing conditions. No previous TB history in family.
```

## Test Case 3: Hypertension

```
Patient presents with persistent headaches, especially at the back of the head. Blood pressure reading is 168/98 mmHg. Reports occasional dizziness and shortness of breath after climbing stairs. Family history of hypertension (mother and older brother).
```

## Test Case 4: Diabetes

```
Patient reports increased thirst, frequent urination, and unexplained weight loss despite increased appetite. Has noticed blurred vision occasionally and wounds healing slowly. Random blood sugar test shows 11.2 mmol/L.
```

## Test Case 5: Meningitis

```
Patient presents with severe headache, neck stiffness, and high fever (39.5°C). Shows sensitivity to bright light and reports vomiting since morning. Confusion noted during examination. No recent travel history but attends large university classes.
```

## Test Case 6: Local Terminology

```
Patient complains of atiridii (hot/cold sensation), reports "pressure" problem (local term for hypertension), and says they have been suffering from "sugar disease" (local term for diabetes). Patient also mentions feeling weak and having "maleria" (local spelling of malaria).
```

## Test Case 7: Multiple Conditions

```
Patient is a 52-year-old with persistent cough, occasional chest pain, and shortness of breath. Reports high blood pressure readings at home and increased urination. Has lost weight despite no changes in diet. Family history of diabetes and hypertension.
```

## Test Case 8: Maternal Health

```
Pregnant woman (32 weeks) presents with swollen feet, headache, and reports seeing spots in vision. Blood pressure reading is 158/96 mmHg. Complains of back pain and reduced fetal movement since yesterday.
```

## Test Case 9: Malnutrition

```
Child presents with visible wasting, protruding belly, and hair discoloration. Mother reports child has poor appetite and frequent diarrhea. Weight is significantly below standard for age (15kg at 5 years). Shows signs of delayed development.
```

## Test Case 10: Culturally Sensitive Case

```
Patient believes illness is connected to spiritual causes and has visited traditional healer before coming to clinic. Shows symptoms of fever, jaundice, and abdominal pain. Willing to take medication but concerned about conflicts with traditional remedies already taken.
```

## Instructions for Testing

1. Copy and paste each test case into a new clinical note
2. Observe the AI analysis results
3. Verify that:
   - Correct conditions are identified
   - Confidence scores are appropriate
   - Symptoms are correctly extracted
   - Treatment recommendations are relevant
   - Cultural considerations are respected when present
