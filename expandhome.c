#ifndef _WIN32
# define _POSIX_SOURCE
# include <unistd.h>
# include <sys/types.h>
# include <pwd.h>
# include <stdlib.h>
# include <string.h>
# define EXPORT
#else
# include <windows.h>
# include <sddl.h>
# define EXPORT __declspec(dllexport)

static wchar_t*
utf8_to_wcstr(const char* utf8) {
  int len = MultiByteToWideChar(CP_UTF8, 0, utf8, -1, NULL, 0);
  wchar_t* buf = (wchar_t*) malloc(len);
  MultiByteToWideChar(CP_UTF8, 0, utf8, -1, buf, len);
  return buf;
}

static char*
wcstr_to_utf8(const wchar_t* wcstr) {
  int len = WideCharToMultiByte(CP_UTF8, 0, wcstr, -1, NULL, 0, NULL, NULL );
  char* buf = (char*) malloc(len);
  WideCharToMultiByte(CP_UTF8, 0, wcstr, -1, buf, len, NULL, NULL);
  return buf;
}
#endif

void
deno_plugin_init(void) {
}

EXPORT const char*
expandhome(const char* name) {
#ifndef _WIN32
  struct passwd *pwd;
  if (name == NULL || *name == 0) {
    pwd = getpwuid(getuid());
  } else {
    pwd = getpwnam(name);
  }
  if (pwd == NULL)
    return NULL;
  return strdup((const char*) pwd->pw_dir);
#else
  WCHAR szDomainName[256];
  DWORD dwSizeDomain = sizeof(szDomainName) / sizeof(WCHAR);
  DWORD dwSizeSid = 0;
  SID_NAME_USE sidName;

  PSID pSid;
  DWORD dwSidLen = 0;
  WCHAR buf[1024];
  DWORD dwDomainLen = sizeof(buf);
  SID_NAME_USE snu;

  LPWSTR un;

  if (name == NULL || *name == 0) {
    DWORD unlen = 0;
    GetUserNameW(NULL, &unlen);
    un = (LPWSTR) malloc(sizeof(WCHAR) * unlen);
    if (un == NULL)
      goto failed;
    *un = 0;
    if (!GetUserNameW(un, &unlen))
      goto failed;
  } else {
    un = utf8_to_wcstr(name);
  }
  LookupAccountNameW(NULL, un, NULL, &dwSidLen, buf, &dwDomainLen, &snu);
  pSid = (PSID) HeapAlloc(GetProcessHeap(), 0, dwSidLen);
  if (pSid == NULL)
    goto failed;
  if (!LookupAccountNameW(NULL, un, pSid, &dwSidLen, buf, &dwDomainLen, &snu))
    goto failed;
  LPWSTR szSid = NULL;
  ConvertSidToStringSidW(pSid, &szSid);

  wcscpy(buf, L"SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\ProfileList\\");
  wcscat(buf, szSid);
  HKEY hKey = NULL;
  DWORD dwResult = RegOpenKeyExW(HKEY_LOCAL_MACHINE, buf, 0, KEY_QUERY_VALUE, &hKey);
  if (dwResult != ERROR_SUCCESS)
    goto failed;
  DWORD dwType = 0, dwReadSize = sizeof(buf);
  dwResult = RegQueryValueExW(hKey, L"ProfileImagePath", 0, &dwType, (LPBYTE)buf, &dwReadSize);
  if (dwResult != ERROR_SUCCESS)
    goto failed;
  HeapFree(GetProcessHeap(), 0, pSid);
  LocalFree(szSid);
  RegCloseKey(hKey);
  free(un);
  return wcstr_to_utf8(buf);

failed:
  if (hKey != NULL) RegCloseKey(hKey);
  if (pSid != NULL) HeapFree(GetProcessHeap(), 0, pSid);
  if (szSid != NULL) LocalFree(szSid);
  if (un != NULL) free(un);
  return NULL;
#endif
}

EXPORT void
free_buf(void* p) {
  free(p);
}
