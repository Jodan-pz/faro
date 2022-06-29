# 1.4.2

1. -======== **Db Options Builder** ========-
    - [x] Change MongoDb Connection string builder.

2. -======== **DataRootPath** ========-
    - [x] Add to Keys Iterator, Decorators and Validators, implement where a path is used in configuration.
    - [x] Update for ALL usage of variable checking first as absolute then, if not exist, with root data path.

3. -======== **Enum to String** ========-
    - [x] Update all engines kind/type enum to static const string

4. -======== **WebApi add controller to retrieve all engines kind/types** ========-
    - [x] EngineRegistrationController:GetRegistered()

5. -======== **Make Expression Evaluation faster!** ========-
    - [x] (do not recreate parser? update to singleton?)

6. -======== **Pluggable Addons via descriptor** ========-
    - [x] Manage external addons by configuration file (YML)

7. -======== **Exception Handling bubbling** ========-
    - [x] Add more state/contextual information to exception on execution of:
    - [x] Keys Iterators
    - [x] Decorators
    - [x] Validators
    - [x] Aggregators
    - [x] Writers
    adding source (def/args) to exceptions. (rethrow enriched exceptions)

8. -======== **BATCH integrity check** ========-
    - [x] Add argument ENABLE_CHECK (default false)

9. -======== **Validators/Aggregators/Writers field descriptors** ========-
    - [x] Aggregators
    - [x] Validators
    - [x] Writers

10. -======== **Image filter by discardable row** ========-
    - [x] Evaluate filter for image output row and tag discardable iteration rows

11. -======== **Unlink Validators from Image** =========-
    - [x] Remove image field from validator
    - [x] Update integrity check for new structure
    - [x] Update Image api for retrieve compatible validators/writers (easy way, slow, no table sync for now...)

12. -======== **Addons - Multiple Validators/Writers** ========-
    - [x] Create multiple validators/writers
    Use case example: parallel multiple executions of 
                      validators (with fail fast option)
                      and writers

13. -======== **Addons - Streamable Writers** ========-
    - [x] Create a streamable writer (chainable)
    - [x] Create a generic stream to file writer
    - [x] Create a generic stream to mail sender writer (as attachment)
    Use case example: define a writer that create a file and then send it by email

14. -======== **Validators/Aggregators/Writers usage** ========-
    - [x] Add validator usage
    - [x] Add aggregator usage
    - [x] Extend usage apis: 
        - ListFlowItemsByValidator
        - ListFlowItemsByWriter
        to retrieve possibile writer/validator usage in nestend config (multi/hierarchical)

15. -======== **Image** ========-
    - [x] Breakable iteration
    - [x] Persister with rebuild at step (layer name/row/aggregator)
    - [x] MySql Flow item image persister
    - [x] IFlowItemImagePersister: add get persister state by flow item with args
    - [x] ImageController: add GetPersisterState(ImageBuildDefinition) 
    - [x] Client: manage inage build/flow run by persister state

16. -======== **Validators** ========-
    - [x] Default Validator Fail-Fast option

17. -======== **Multi Writer (Zip) +Mark+** ========-
    - [x] Add zip functionality to multiple writer by configuration (streamzip)

18. -======== **Image** ========-
    - [x] Prebuild list of parallelizable decorators by layer when building schema (optz) 
    
19. -======== **App Support & IConnectionRetriever interface** ========-
    - [x] Externalize configuration/implementation and injection.

20. -======== **Addons - File System** ========-
    - [x] Create a simple file system entries keys iterator
    - [x] Create a simple file operation writer (copy/move)

21. -======== **KeysIterators** ========-
    - [x] Create default RangeKeysIterator (start/end/step)

22. -======== **Addos - Big Move** ========-   
    - [x] Move decorators, keysiterators & writers engines to addons lib 
         (except RangeKeysIterator/Constant-Key-Expression Decorator/Deafult Validator/Default Aggregator/Console Writer)

23. -======== **IDataResourceService** ========-
    - [x] Change DataRootPath to interface injection to better manage
          external resources for all items
    - [x] Introduce methods to easy get resources as GetResource(s)(resourceName)

24. -======== **Batch** ========-
    - [x] Introduce a nicer flow visualizer while running

25. -======== **Parallel Helper** ========-
    - [x] Move into FARO.Common

26. -======== **NiceFlowRunner DI** ========-
    - [x] Use better switch selector for type injection

27. -======== **IDefinitionDataService DI** ========-
    - [x] Configurable DefinitionDataService by kind 
      - default -> JsonFileDefinitionDataService
      - external-> defined by asssembly, class, register method
      - none    -> no service (eg: _batch-only reader adapter for single json file_)

28. -======== **NiceFlowRunner DI** ========-
    - [x] Use better switch selector for type injection

29. -======== **FlowConfiguration** ========-
    - [x] Add Checked(bool check) 
    - [x] Use integrity check in flow runner (remove batch call) - consistency
    
30. -======== **NiceFlowRunner** ========-
    - [x] Nice table with flow run info introduction
    - [x] Nice flow run summaries (total times)
    - [x] Nice Validating exceptions table result
    - [x] Nice Check exceptions table result

31. -======== **Add resource management** ========-
    - [x] Server - add upload apis (keys/dec/val/agg/wri) to web server (relative file path with stream)
    - [ ] Client - add a folder (with dropzone?) management for all items

32.  -======== **IAppSupport** ========-
     - [x] Add Image Persister connection to IAppSupport
     - [x] Add Cache connection to IAppSupport

33. -======== **AppSettings** ========-
    - [x] Add FlowBuilderConfiguration by kind (default/json)

34. -======== **Addons - Refactor** ========-
    - [ ] Review the implementation to use shared code between keys & decorators

35. -======== **IExpressionEvaluator** ========-
    - [x] Remove static helper class
    - [x] Customizable expression by configuration (default to Flee)
    
36. -======== **Support** ========-
    - [x] Add CLI

37. **Unit test all new features**
    - [x] Addons tests
    - [x] Main test
