## 1. Introduction
You are asked to create an application to load candidates from a frontend and to be
processed by a backend.

## 2. Requirements
- **Angular**: Use Angular 16+ with Angular Material.
- **Forms**: Use reactive forms to collect the required information.
- **Backend**: Use NestJs.

## 3. Front
1. Name (string) – required
2. Surname (string) – required
3. An Excel containing the following columns (only 1 line per Excel) – required:
   1. Seniority (junior | senior)
   2. Years of experience (number)
   3. Availability (boolean)

## 4. Backend
- This form must be sent to a backend made in NestJs, which must process the
  Excel and respond with the data combined in a JSON.
- The JSON must be stored incrementally on the front end.
- With the data a table should be drawn showing all the loaded candidates
  showing 5 columns:
  - name
  - surname
  - seniority
  - years
  - availability

## 5. Notes
- The information in the table, it is up to the candidate to choose the way in
  which he/she wants to store/persist it.
- Functional and reactive programming will be positively valued.
- The use of resources from the frameworks themselves with the intention of
  reducing the amount of custom code will be positively valued.
- The use of standalone components will be positively valued.
- The inclusion of tests (preferably Jest) will be positively valued.