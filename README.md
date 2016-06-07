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
    console.log({err:err})
  } else {
    if (!response.changed){
      changed = false;
    }
    try {
      var stringOutput = JSON.stringify(response)
      console.log(stringOutput);
    }
    catch(err){
      console.log({err: err});
    }
  }

  
}

```

Create file e.g. deployMBaaS.yml

```

---
- hosts: localhost
  vars: 
    project_name: phtest2
    environments:
      - { name: 'development' }
      - { name: 'test' }
      - { name: 'production' }
    teams:
      - { type: 'developer', name: 'developer' }
      - { type: 'operations', name: 'operations'}
      - { type: 'business', name: 'business'}
  tasks:
    - name: Set RH MAP Target
      fhc:
        action: target
        target: RHMAPDOMAIN
    - name: Login to RH MAP
      fhc:
        action: login
        username: RHMAPUSER
        password: RHMAPPASS
    - name: Create MBaaS Target
      fhc:
        action: createMBaaSTarget
        mbaasName: "{{ project_name }}"
        fhMbaasHost: FHMBAASHOST
        url: FHMBAASURL:8443
        openshiftUsername: OCUSER
        openshiftPassword: OCPASS
        routerDNSUrl: PUBLICDNS
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
    - name: Create Project
      fhc:
        action: createProject
        projectName: "{{ project_name }}" 
      register: project_details
    - name: Create teams
      fhc:
        action: createTeam
        mbaasName: "{{ project_name }}"
        projectGuid: "{{ project_details.output.guid }}"
        environments: "{{ deployedenvironments.results | map(attribute='output.id')|join(',') }}"
        mbaases: "{{ deployedmbaases.results | map(attribute='output.id')|join(',') }}"
    - name: Create User
      fhc:
        action: createUser
        username: test@redhat.com
        email: test@redhat.com 
      register: user_details

```

Run command: ansible-playbook  deployMbaaS.yml

##Tests
npm test
