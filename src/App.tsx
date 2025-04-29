import React, { useState } from "react";
import "./index.css";
import "./App.css";
const API_BASE = "https://dynamic-form-generator-9rl7.onrender.com";

function App() {
  //pehle states bana lete hai rn,name,login,load
  const [rollNumber, setRollNumber] = useState("");
  const [name, setName] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ab isnide the form need to create a state
  const [form, setForm] = useState<any>(null);
  // alag alag sections /Section navigation and form data state ab
  const [sectionIdx, setSectionIdx] = useState(0);
  const [formData, setFormData] = useState<any>({});
  const [formErrors, setFormErrors] = useState<any>({});

  // login handle karne
  // const handleLogin = async (e : React.for)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/create-user`, {
        method: "POST",
        // headers : {"content-Type" : "application/json"}
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rollNumber, name }),
      });
      if (!res.ok) throw new Error("Registration failed");
      setIsLoggedIn(true);
      // Fetch form after login, dynamically render karna hai
      const formRes = await fetch(
        `${API_BASE}/get-form?rollNumber=${rollNumber}`
      );

      const data = await formRes.json();
      console.log(data);
      setForm(data.form);
      // catch
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // yahan pe Validate inputs dynamically
  const validateSection = (section: any) => {
    const errors: any = {};
    section.fields.forEach((field: any) => {
      const value = formData[field.fieldId];
      if (
        field.required &&
        (!value || value === "" || (Array.isArray(value) && value.length === 0))
      ) {
        errors[field.fieldId] =
          field.validation?.message || "This field is required";
      } else if (field.minLength && value && value.length < field.minLength) {
        errors[field.fieldId] = `Minimum length is ${field.minLength}`;
      } else if (field.maxLength && value && value.length > field.maxLength) {
        errors[field.fieldId] = `Maximum length is ${field.maxLength}`;
      }
    });
    return errors;
  };

  // Handle field change
  const handleFieldChange = (field: any, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field.fieldId]: value }));
    setFormErrors((prev: any) => ({ ...prev, [field.fieldId]: undefined }));
  };

  // Handle next section
  const handleNext = () => {
    const section = form.sections[sectionIdx];
    const errors = validateSection(section);
    setFormErrors(errors);
    if (Object.keys(errors).length === 0) {
      setSectionIdx(sectionIdx + 1);
    }
  };

  // Handle prev section
  const handlePrev = () => {
    setSectionIdx(sectionIdx - 1);
  };

  // Handle submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const section = form.sections[sectionIdx];
    const errors = validateSection(section);
    setFormErrors(errors);
    if (Object.keys(errors).length === 0) {
      // All sections valid, log data
      console.log("Form Data:", formData);
      alert("Form submitted! Check console for data.");
    }
  };

  // Render field based on type
  const renderField = (field: any) => {
    const value =
      formData[field.fieldId] || (field.type === "checkbox" ? [] : "");
    const error = formErrors[field.fieldId];
    switch (field.type) {
      case "text":
      case "tel":
      case "email":
      case "date":
        return (
          <div key={field.fieldId} style={{ marginBottom: 8 }}>
            <label>
              {field.label}
              {field.required && " *"}
            </label>
            <br />
            <input
              type={field.type}
              placeholder={field.placeholder}
              value={value}
              data-testid={field.dataTestId}
              maxLength={field.maxLength}
              minLength={field.minLength}
              onChange={(e) => handleFieldChange(field, e.target.value)}
            />
            {error && <div style={{ color: "red" }}>{error}</div>}
          </div>
        );
      case "textarea":
        return (
          <div key={field.fieldId} style={{ marginBottom: 8 }}>
            <label>
              {field.label}
              {field.required && " *"}
            </label>
            <br />
            <textarea
              placeholder={field.placeholder}
              value={value}
              data-testid={field.dataTestId}
              maxLength={field.maxLength}
              minLength={field.minLength}
              onChange={(e) => handleFieldChange(field, e.target.value)}
            />
            {error && <div style={{ color: "red" }}>{error}</div>}
          </div>
        );
      case "dropdown":
        return (
          <div key={field.fieldId} style={{ marginBottom: 8 }}>
            <label>
              {field.label}
              {field.required && " *"}
            </label>
            <br />
            <select
              value={value}
              data-testid={field.dataTestId}
              onChange={(e) => handleFieldChange(field, e.target.value)}
            >
              <option value="">Select...</option>
              {field.options?.map((opt: any) => (
                <option
                  key={opt.value}
                  value={opt.value}
                  data-testid={opt.dataTestId}
                >
                  {opt.label}
                </option>
              ))}
            </select>
            {error && <div style={{ color: "red" }}>{error}</div>}
          </div>
        );
      case "radio":
        return (
          <div key={field.fieldId} style={{ marginBottom: 8 }}>
            <label>
              {field.label}
              {field.required && " *"}
            </label>
            <br />
            {field.options?.map((opt: any) => (
              <label key={opt.value} style={{ marginRight: 8 }}>
                <input
                  type="radio"
                  name={field.fieldId}
                  value={opt.value}
                  checked={value === opt.value}
                  data-testid={opt.dataTestId}
                  onChange={() => handleFieldChange(field, opt.value)}
                />{" "}
                {opt.label}
              </label>
            ))}
            {error && <div style={{ color: "red" }}>{error}</div>}
          </div>
        );
      case "checkbox":
        return (
          <div key={field.fieldId} style={{ marginBottom: 8 }}>
            <label>
              {field.label}
              {field.required && " *"}
            </label>
            <br />
            {field.options?.map((opt: any) => (
              <label key={opt.value} style={{ marginRight: 8 }}>
                <input
                  type="checkbox"
                  name={field.fieldId}
                  value={opt.value}
                  checked={value.includes(opt.value)}
                  data-testid={opt.dataTestId}
                  onChange={(e) => {
                    let newArr = Array.isArray(value) ? [...value] : [];
                    if (e.target.checked) newArr.push(opt.value);
                    else newArr = newArr.filter((v: any) => v !== opt.value);
                    handleFieldChange(field, newArr);
                  }}
                />{" "}
                {opt.label}
              </label>
            ))}
            {error && <div style={{ color: "red" }}>{error}</div>}
          </div>
        );
      default:
        return null;
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="login-container">
        <h2>Student Login</h2>
        <form onSubmit={handleLogin}>
          <div>
            <label>Roll Number : </label>

            <input
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              required
            />
          </div>
          <br></br>

          <div>
            <label>Name : </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <br></br>
          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
          {error && <div style={{ color: "red" }}>{error}</div>}
        </form>
      </div>
    );
  }

  if (!form) return <div>Loading form...</div>;

  const section = form.sections[sectionIdx];
  const isLast = sectionIdx === form.sections.length - 1;

  return (
    <div>
      <h1>{form.formTitle}</h1>
      <form
        onSubmit={
          isLast
            ? handleSubmit
            : (e) => {
                e.preventDefault();
                handleNext();
              }
        }
      >
        <h2>{section.title}</h2>
        <p>{section.description}</p>
        {section.fields.map(renderField)}
        <div style={{ marginTop: 16 }}>
          {sectionIdx > 0 && (
            <button
              type="button"
              onClick={handlePrev}
              style={{ marginRight: 8 }}
            >
              Prev
            </button>
          )}
          {!isLast}
          {!isLast && <button type="submit">Next</button>}
          {isLast && <button type="submit">Submit</button>}
        </div>
      </form>
    </div>
  );
}

export default App;
