import { useCallback, useState } from 'react';

export interface ValidationErrors {
    [key: string]: string | undefined;
}

export interface FormValidationRules {
    [key: string]: (value: any) => string | undefined;
}

export const useFormValidation = (rules: FormValidationRules) => {
    const [errors, setErrors] = useState<ValidationErrors>({});

    const validate = useCallback(
        (formData: Record<string, any>) => {
            const newErrors: ValidationErrors = {};

            Object.keys(rules).forEach((fieldName) => {
                const validator = rules[fieldName];
                const error = validator(formData[fieldName]);
                if (error) {
                    newErrors[fieldName] = error;
                }
            });

            setErrors(newErrors);
            return Object.keys(newErrors).length === 0;
        },
        [rules]
    );

    const clearErrors = useCallback(() => {
        setErrors({});
    }, []);

    const clearFieldError = useCallback((fieldName: string) => {
        setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[fieldName];
            return newErrors;
        });
    }, []);

    return {
        errors,
        validate,
        clearErrors,
        clearFieldError,
        hasErrors: Object.keys(errors).length > 0,
    };
};
