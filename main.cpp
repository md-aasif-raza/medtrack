#include <fstream>
#include <iomanip>
#include <iostream>
#include <string>
#include <vector>

using namespace std;

// ==========================================
// 1. ENCAPSULATION: Base Class Medicine
// ==========================================
class Medicine {
protected:
  string name;
  string dose;
  string time;
  int duration;
  string category;

public:
  Medicine() : name(""), dose(""), time(""), duration(0), category("") {}

  Medicine(string n, string d, string t, int dur, string c) {
    name = n;
    dose = d;
    time = t;
    duration = dur;
    category = c;
  }

  // Encapsulation: Getter for name
  string getName() const { return name; }

  // Operator Overloading: Compare medicines by name
  bool operator==(const Medicine &other) const {
    return this->name == other.name;
  }

  virtual void display() const {
    cout << left << setw(20) << name << setw(15) << dose << setw(15) << time
         << setw(10) << duration << setw(15) << category << endl;
  }

  // Helper for file saving
  string serialize() const {
    return name + "|" + dose + "|" + time + "|" + to_string(duration) + "|" +
           category;
  }
};

// ==========================================
// 2. INHERITANCE: Derived Class HealthRecord
// ==========================================
class HealthRecord : public Medicine {
private:
  string metric;
  string value;
  string status;

public:
  HealthRecord(string m, string v, string s, string date) {
    metric = m;
    value = v;
    status = s;
    this->time = date; // Using base class 'time' to store date
  }

  // Polymorphism: Overriding display
  void display() const override {
    cout << left << setw(20) << metric << setw(15) << value << setw(15) << time
         << setw(15) << status << endl;
  }

  string serializeRecord() const {
    return metric + "|" + value + "|" + status + "|" + time;
  }
};

// ==========================================
// 3. PROJECT MANAGER (Logic)
// ==========================================
class TrackerSystem {
private:
  vector<Medicine> medicines;
  vector<HealthRecord> records;

public:
  void addMedicine() {
    string n, d, t, c;
    int dur;
    cout << "\n--- Add New Medicine ---\n";
    cout << "Name: ";
    cin.ignore();
    getline(cin, n);
    cout << "Dose (e.g. 1 tab): ";
    getline(cin, d);
    cout << "Time (Morning/Night): ";
    getline(cin, t);
    cout << "Duration (days): ";
    cin >> dur;
    cout << "Category: ";
    cin.ignore();
    getline(cin, c);

    Medicine newMed(n, d, t, dur, c);

    // Use Operator Overloading (==) to check duplicate
    for (const auto &m : medicines) {
      if (m == newMed) {
        cout << "Error: Medicine already exists!\n";
        return;
      }
    }

    medicines.push_back(newMed);
    saveToFile();
    cout << "Medicine added successfully!\n";
  }

  void addHealthRecord() {
    string m, v, s, dt;
    cout << "\n--- Log Health Vital ---\n";
    cout << "Metric (BP/Sugar/Weight): ";
    cin.ignore();
    getline(cin, m);
    cout << "Value: ";
    getline(cin, v);
    cout << "Status (Normal/High): ";
    getline(cin, s);
    cout << "Date (DD-MM-YYYY): ";
    getline(cin, dt);

    records.push_back(HealthRecord(m, v, s, dt));
    saveToFile();
    cout << "Record saved successfully!\n";
  }

  void showAll() {
    cout << "\n" << string(75, '=') << "\n";
    cout << "MEDICINE LIST\n";
    cout << left << setw(20) << "Name" << setw(15) << "Dose" << setw(15)
         << "Time" << setw(10) << "Days" << setw(15) << "Category" << endl;
    cout << string(75, '-') << endl;
    for (const auto &m : medicines)
      m.display();

    cout << "\nHEALTH LOG\n";
    cout << left << setw(20) << "Metric" << setw(15) << "Value" << setw(15)
         << "Date" << setw(15) << "Status" << endl;
    cout << string(75, '-') << endl;
    for (const auto &r : records)
      r.display();
    cout << string(75, '=') << "\n";
  }

  void saveToFile() {
    ofstream out("data.txt");
    out << "MEDS\n";
    for (const auto &m : medicines)
      out << m.serialize() << "\n";
    out << "RECORDS\n";
    for (const auto &r : records)
      out << r.serializeRecord() << "\n";
    out.close();
  }
};

int main() {
  TrackerSystem sys;
  int choice;

  while (true) {
    cout << "\n====================================\n";
    cout << "   MEDTRACK PRO (C++ OOP Edition)   \n";
    cout << "====================================\n";
    cout << "1. Add Medicine\n";
    cout << "2. Log Health Vital\n";
    cout << "3. View Dashboard\n";
    cout << "4. Exit\n";
    cout << "Choice: ";
    cin >> choice;

    switch (choice) {
    case 1:
      sys.addMedicine();
      break;
    case 2:
      sys.addHealthRecord();
      break;
    case 3:
      sys.showAll();
      break;
    case 4:
      cout << "Exiting...\n";
      return 0;
    default:
      cout << "Invalid choice!\n";
    }
  }
  return 0;
}
