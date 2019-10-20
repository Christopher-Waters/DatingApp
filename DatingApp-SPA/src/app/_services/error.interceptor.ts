import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpResponse, HttpErrorResponse, HTTP_INTERCEPTORS } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    intercept(
        req: import('@angular/common/http').HttpRequest<any>,
        next: import('@angular/common/http').HttpHandler
    ): import('rxjs').Observable<import('@angular/common/http').HttpEvent<any>> {
        return next.handle(req).pipe(
            catchError(error => {
                if (error.status === 401) {
                    // console.log(error);
                    return throwError(error.statusText);
                }
                if (error instanceof HttpErrorResponse) {
                    // check if application-error exist in header
                    const applicationError = error.headers.get('Application-Error');
                    if (applicationError) {
                        return throwError(applicationError);
                    }

                    // servernError refer to 500 error
                    const serverError = error.error;
                    // modelStateError refer to the validation of form
                    let modalStateErrors = '';
                    // if it is 500 error or username already exist, then serverError is string
                    // otherwise, it would be a object contains several array.
                    // the if statement check for second case
                    if (serverError.errors && typeof serverError.errors === 'object') {
                        for (const key in serverError.errors) {
                            if (serverError.errors[key]) {
                                modalStateErrors += serverError.errors[key] + '\n';
                            }
                        }
                    }
                    // if modalStateErros is empty which mean the errors is just a string.
                    // the Server error string refer to that error we didn't expect.
                    return throwError(modalStateErrors || serverError || 'Server Error');
                }
            })
        );
    }

}

export const ErrorInterceptorProvider = {
    provide: HTTP_INTERCEPTORS,
    useClass: ErrorInterceptor,
    multi: true
};
