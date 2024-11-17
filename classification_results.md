# Classification results

## Initial results on top 100 websites

Of the 40116 scripts we analyzed (3192.7MB, details in `script_features.py`):

- Size: 9B~8.7MB, average 80kB, median 2.2kB.
    - Many small scripts.
- No significant correlation between anything.
- Coverage: 67% classified by count, 93% by size.
- Coverage growth potential: 7% by count, 1% by size.
- Half (1296.1MB, 40.60%) scripts by size fall into all sure categories.
    Count 1473 (3.67%).
    - [ ] Look for bloated sites.
    - [ ] What next if we can split it up?
        - [ ] What user impact from size? Aggregate per page?
        - [ ] Chrome execution time of script.

| Feature                | Count | Percentage (%) | Size (MB) | Size Percentage (%) |
| ---------------------- | ----- | -------------- | --------- | ------------------- |
| Total Scripts          | 40116 | -              | 3192.7    | -                   |
| Frontend Processing    | 14129 | 35.22          | 2864.3    | 89.72               |
| DOM Element Generation | 8196  | 20.43          | 2248.9    | 70.44               |
| UX Enhancement         | 4496  | 11.21          | 1840.7    | 57.65               |
| Extensional Features   | 4915  | 12.25          | 1888.1    | 59.14               |
| Silent Scripts         | 10260 | 25.58          | 28.1      | 0.88                |
| Has Request            | 4205  | 10.48          | 1432.1    | 44.86               |
| Queries Element        | 13640 | 34.00          | 2731.6    | 85.56               |
| Uses Storage           | 4571  | 11.39          | 1641.0    | 51.40               |
| No Sure Category       | 13148 | 32.77          | 221.1     | 6.93                |
| No Category            | 10178 | 25.37          | 179.7     | 5.63                |

| Feature Combination        | Frontend Processing              | DOM Element Generation           | UX Enhancement                  | Extensional Features            | Has Request                     | Queries Element                 |
| -------------------------- | -------------------------------- | -------------------------------- | ------------------------------- | ------------------------------- | ------------------------------- | ------------------------------- |
| **DOM Element Generation** | 6602 (16.46%), 2197.1MB (68.82%) | -                                | -                               | -                               | -                               | -                               |
| **UX Enhancement**         | 3840 (9.57%), 1821.5MB (57.05%)  | 3125 (7.79%), 1613.2MB (50.53%)  | -                               | -                               | -                               | -                               |
| **Extensional Features**   | 4229 (10.54%), 1841.1MB (57.67%) | 2703 (6.74%), 1562.9MB (48.95%)  | 1844 (4.60%), 1440.5MB (45.12%) | -                               | -                               | -                               |
| **Has Request**            | 3981 (9.92%), 1428.9MB (44.76%)  | 2338 (5.83%), 1192.9MB (37.36%)  | 1459 (3.64%), 1162.6MB (36.42%) | 1755 (4.37%), 1226.1MB (38.40%) | -                               | -                               |
| **Queries Element**        | 9379 (23.38%), 2648.1MB (82.94%) | 6846 (17.07%), 2152.1MB (67.41%) | 3754 (9.36%), 1773.7MB (55.55%) | 3508 (8.74%), 1800.3MB (56.39%) | 3627 (9.04%), 1410.1MB (44.17%) | -                               |
| **Uses Storage**           | 4335 (10.81%), 1633.2MB (51.15%) | 2728 (6.80%), 1362.7MB (42.68%)  | 1669 (4.16%), 1278.9MB (40.06%) | 2093 (5.22%), 1372.2MB (42.98%) | 2424 (6.04%), 1106.1MB (34.64%) | 3722 (9.28%), 1596.9MB (50.02%) |

| Feature Combination                                                     | Scripts Count (%) | Size (MB) (%)     |
| ----------------------------------------------------------------------- | ----------------- | ----------------- |
| **Frontend Processing & DOM Element Generation & UX Enhancement**       | 2813 (7.01%)      | 1604.9MB (50.27%) |
| **Frontend Processing & DOM Element Generation & Extensional Features** | 2679 (6.68%)      | 1533.0MB (48.02%) |
| **Frontend Processing & UX Enhancement & Extensional Features**         | 1814 (4.52%)      | 1439.2MB (45.08%) |
| **DOM Element Generation & UX Enhancement & Extensional Features**      | 1482 (3.69%)      | 1296.6MB (40.61%) |

![script_size_cdf](https://github.com/user-attachments/assets/193b415e-6209-4506-81fd-6f70972b458d)

## Results with the `eval` trick on top 1000 websites

We crawled the top 1000 websites with the `eval` trick applied to scripts.
The `eval` trick rewrites each script into smaller blocks of `eval` calls,
creating V8 execution contexts that maps to smaller blocks of source code.
The unit here is execution context, not script anymore.

- Size: 1B~6MB, average 1.2kB, median 48B, total 26.2GB.
    - Most scripts broken down, but some persisted.
    - Rewritten contexts cover 23.3GB (89.14%) of source code.
        - Some rewritten contexts are still large, probably because of class,
            `else` branch, etc.
- Still no significant correlation between anything.
- Half of the contexts by size do not call any APIs, 84% by count.
- Coverage: 86% classified by count, 87% by size.
    By size, 49.12% silent + 38% classified + 12.87% no-sphere.
    - By size, 98% (3.3GB) of no-sphere contexts make less than
        100 API calls.
    - By size, 80% (667MB) of no-sphere contexts are rewritten.
- One eighth of contexts by size fall into all sure categories (12.37%,
    3235.2MB), which is 1/3 of all contexts belonging to some sphere.
    - Much less than previous results, but still high.

| Feature                | Count    | Percentage (%) | Size (MB) | Size Percentage (%) |
| ---------------------- | -------- | -------------- | --------- | ------------------- |
| Total Contexts         | 21027954 | -              | 26163.2   | -                   |
| Silent Contexts        | 17572814 | 83.57          | 12850.4   | 49.12               |
| Frontend Processing    | 338273   | 1.61           | 9469.6    | 36.19               |
| DOM Element Generation | 72286    | 0.34           | 6250.1    | 23.89               |
| UX Enhancement         | 26536    | 0.13           | 5392.0    | 20.61               |
| Extensional Features   | 32647    | 0.16           | 5617.2    | 21.47               |
| Has Request            | 16821    | 0.08           | 4318.8    | 16.51               |
| Queries Element        | 120844   | 0.57           | 7719.9    | 29.51               |
| Uses Storage           | 26081    | 0.12           | 5142.6    | 19.66               |

| Feature Combination        | Frontend Processing              | DOM Element Generation           | UX Enhancement                   | Extensional Features            | Has Request                     | Queries Element                 |
| -------------------------- | -------------------------------- | -------------------------------- | -------------------------------- | ------------------------------- | ------------------------------- | ------------------------------- |
| **DOM Element Generation** | 20763 (0.10%), 5924.2MB (22.64%) | -                                | -                                | -                               | -                               | -                               |
| **UX Enhancement**         | 15544 (0.07%), 5229.6MB (19.99%) | 12910 (0.06%), 4537.7MB (17.34%) | -                                | -                               | -                               | -                               |
| **Extensional Features**   | 13557 (0.06%), 5540.2MB (21.18%) | 6207 (0.03%), 4006.9MB (15.31%)  | 5369 (0.03%), 3667.5MB (14.02%)  | -                               | -                               | -                               |
| **Has Request**            | 10514 (0.05%), 4276.4MB (16.35%) | 5694 (0.03%), 3081.3MB (11.78%)  | 4519 (0.02%), 3041.1MB (11.62%)  | 4926 (0.02%), 3572.3MB (13.65%) | -                               | -                               |
| **Queries Element**        | 33064 (0.16%), 7174.1MB (27.42%) | 29577 (0.14%), 5575.6MB (21.31%) | 15820 (0.08%), 4875.0MB (18.63%) | 7871 (0.04%), 4812.3MB (18.39%) | 7730 (0.04%), 3857.2MB (14.74%) | -                               |
| **Uses Storage**           | 13332 (0.06%), 5067.7MB (19.37%) | 7018 (0.03%), 3569.3MB (13.64%)  | 5109 (0.02%), 3400.2MB (13.00%)  | 5215 (0.02%), 3815.2MB (14.58%) | 6573 (0.03%), 3583.0MB (13.69%) | 9930 (0.05%), 4640.1MB (17.74%) |

| Feature Combination                                                     | Scripts Count (%) | Size (MB) (%)     |
| ----------------------------------------------------------------------- | ----------------- | ----------------- |
| **Frontend Processing & DOM Element Generation & UX Enhancement**       | 10291 (0.05%)     | 4483.3MB (17.14%) |
| **Frontend Processing & DOM Element Generation & Extensional Features** | 6022 (0.03%)      | 3975.0MB (15.19%) |
| **Frontend Processing & UX Enhancement & Extensional Features**         | 5241 (0.02%)      | 3664.5MB (14.01%) |
| **DOM Element Generation & UX Enhancement & Extensional Features**      | 4078 (0.02%)      | 3235.9MB (12.37%) |

![script_size_cdf2](https://github.com/user-attachments/assets/03316a53-5f9c-4140-a9f2-386dce189a86)
