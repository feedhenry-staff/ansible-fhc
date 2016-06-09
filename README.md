#FHC Ansible Module
Node.js Ansible module to enable calls the the fh-fhc npm module.
When Ansible calls this script it is first exported to a temp script.  The script is then called from a temp directory created by Ansible.
For this reason, we must install this module in $HOME/.ansible/node_modules

Module is limited to supporting a subset of FHC commands currently
* target
* login
* admin.mbaas.create
* admin.environments.create
* admin.teams.create
* project create
* admin-users create

When calls are made to FHC e.g. to create a user, a check is performed to determine if this is a change or not.  In the case of user creation the module first checks to see if the user exists.  If the user exists the following is returned:
{"changed": false, "guid": "k4jkkehihwozzd4ravd7uj6e"}

If the user does not exist the following is returned:

{"changed": true, "guid": "k4jkkehihwozzd4ravd7uj6e"}

Ansible will then use this information to report if the calls made changes or not.

##Arguments
Ansible passed arguments as the contents of a text file in the format: "action=createProject projectName=projectNameproject2"
Calling init.getArgs will read the contents of the filename passed by Ansible when the script is invoked (process.argv[2]) and process into an array of key value pairs.

##Usage

###Via ansible playbook
Create a file e.g. fhc.js and store in /library

```js
#!/usr/local/bin/node
fs = require('fs');
var ansiblefhc = require('ansible-fhc');

// get arguments passed in by file
ansiblefhc.init.getArgs(function(err, args){
  var action;
  if (err){
    finish({err: err});
  } else {
    // load the fhc module.
    ansiblefhc.init.fhLoad(function(err, success){
      if (err ){
        finish({err: err});
      } else {
        action = args.action;
        // perform the action (first argument passed)
        ansiblefhc.process(action, args, finish);
      }
    });
  }
});

function finish(err, response ){
  if (err){
    console.log(err)
  } else {
    if (!response.changed){
      response.changed = false;
    }
    try {
      var stringOutput = JSON.stringify(response)
      console.log(stringOutput);
    }
    catch(err){
      console.log(err);
    }
  }

  
}

```

Create file e.g. roles/rhmap/tasks/main.yml

```

---
  - name: Set RH MAP Target
    fhc:
      action: target
      target: "{{ rhmap.domain }}"
  - name: Login to RH MAP
    fhc:
      action: login
      username: "{{ rhmap.username }}"
      password: "{{ rhmap.password }}"
  - name: Create MBaaS Target
    fhc:
      action: createMBaaSTarget
      mbaasName: "{{ project_name }}"
      fhMbaasHost: https://"{{ project_name }}"-"{{ item.name }}"."{{ openshift.hostname }}"
      url: https://"{{ openshift.hostname }}":"{{ openshift.port }}"
      openshiftUsername: "{{ openshift.username }}"
      openshiftPassword: "{{ openshift.password }}"
      routerDNSUrl: "{{ openshift.wildcard_dns }}"
      environment: "{{ item.name }}"
    register: deployedmbaases
    with_items: 
      "{{ environments }}"
  - debug: 
      var: deployedmbaases
  - name: Create Environment
    fhc:
      action: createEnvironment
      mbaasName: "{{ project_name }}"
      environment: "{{ item.name }}"
    register: deployedenvironments
    with_items: 
      "{{ environments }}"
  - name: Create RH MAP Project
    fhc:
      action: createProject
      projectName: "{{ project_name }}" 
    register: project_details
  - debug: 
      var: project_details
  - name: Create teams
    fhc:
      action: createTeam
      mbaasName: "{{ project_name }}"
      type: "{{ item.type }}"
      name: "{{ item.name }}"
      projectGuid: "{{ project_details.response.guid }}"
      environment_permissions: "{{ item.environments  | map(attribute='name')|join(',') }}"
    with_items: 
      "{{ teams }}"
  - name: Create RHMAP Users
    fhc:
      action: createUser
      username: "{{ item.username }}"
      email: "{{ item.email }}" 
    register: user_details
    with_items: 
      "{{ rhmap.users }}"
  - name: Add RHMAP Users to Teams
    fhc:
      action: addUserToTeam
      mbaasName: "{{ project_name }}"
      username: "{{ item.username }}"
      teamName: "{{ item.team }}" 
    with_items: 
      "{{ rhmap.users }}"

```

Run command: ansible-playbook  deployMbaaS.yml

##Tests
npm test
